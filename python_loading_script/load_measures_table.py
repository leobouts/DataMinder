import pymysql
import csv
import sys

global password
# nikos pc password
#password = 'db@cs.uoi2019'

#leo pc password
password = 'password'

table_query = "CREATE TABLE measures (index_id INT AUTO_INCREMENT PRIMARY KEY,m_index VARCHAR(40),m_type VARCHAR(10),measure VARCHAR(40))"


#nikos pc final.csv path

#csv_path = "D:\\Documents\\DOCS\\UOI\\10o\\DB_2\\Project\\temp\\final.csv"

#leo mac laptop final.csv path 
csv_path = '/Users/leonidas/desktop/normalized_csvs/final.csv'

try:
    
    con = pymysql.connect(host='127.0.0.1', user='root', password=password, autocommit=True, local_infile=1)
    print('Connected to DB: {}'.format('127.0.0.1'))
    # Create cursor and execute Load SQL
    cursor = con.cursor()
    cursor.execute("USE testdb;")
 
    
    with open(csv_path, mode='r') as read_file:
    	index = []
    	type_m = []
    	measure = []

    	csv_reader = csv.reader(read_file, delimiter=',')
    	line_count = 0
    	for i in csv_reader:
    		col_count = 0

    		for j in i:
    			if col_count >= 2:

    				if line_count == 0:
    					index.append(j)
    				elif line_count == 1:
    					type_m.append(j)
    				elif line_count == 2:
    					measure.append(j)

    			col_count += 1

    		if line_count == 2:
    			break
    		line_count += 1

    	#print(index)
    	#print(type_m)
    	#print(measure)


    cursor.execute("CREATE TABLE IF NOT EXISTS measures (index_id INT AUTO_INCREMENT PRIMARY KEY,m_index VARCHAR(40),m_type VARCHAR(10),measure VARCHAR(40))ENGINE = INNODB")
    
    i = 0
    for k in index:
    	#print(k)
    	#print(type_m[i])
    	#print(measure[i])
    	temp = "INSERT INTO measures (m_index, m_type, measure) VALUES (\"" + k + "\",\""+ type_m[i] + "\",\"" + measure[i] + "\")"
    	#print(temp)
    	cursor.execute(temp)
    	i += 1

    con.close()    
except Exception as e:
    print('Error: {}'.format(str(e)))
    sys.exit(1)