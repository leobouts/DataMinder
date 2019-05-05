import pymysql
import csv
import sys

global password
# nikos pc password
password = 'db@cs.uoi2019'


table_query = """CREATE TABLE years (
	year int,
	five_years varchar(12),
	ten_years varchar(12)
	)"""

loading_query = """LOAD DATA LOCAL INFILE "years.csv" 
    INTO TABLE years
    FIELDS TERMINATED BY ',' 
    ENCLOSED BY '"' 
    LINES TERMINATED BY '\n'
    IGNORE 1 ROWS
    (year, five_years, ten_years);"""




def choose_five_years(year):
	temp = int(year)
	min_y = temp // 10
	min_y = min_y * 10
	if temp >= (min_y + 6):
		min_y = min_y + 6
	else:
		min_y = min_y + 1

	max_y = min_y + 4
	return str(min_y) + "-" + str(max_y)


def choose_ten_years(year):
	temp = int(year)
	min_y = temp // 10
	min_y = min_y * 10
	max_y = min_y + 10
	return str(min_y) + "-" + str(max_y)




try:
    
    con = pymysql.connect(host='127.0.0.1', user='root', password=password, autocommit=True, local_infile=1)
    print('Connected to DB: {}'.format('127.0.0.1'))
    # Create cursor and execute Load SQL
    cursor = con.cursor()
    cursor.execute("USE testdb;")
    years = cursor.execute("SELECT DISTINCT year FROM data")
 	
    print(years)
    years = cursor.fetchall()

    
    new_list= []

    for y in years:
    	new_list.append([y[0], choose_five_years(y[0]), choose_ten_years(y[0])])

    for i in new_list:
    	print(i)
    
    with open('years.csv', mode='w') as write_file:
    	writer = csv.writer(write_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    	
    	writer.writerow(["year", "five_years", "ten_years"])
    	for i in new_list:
    		writer.writerow(i)

    cursor.execute(table_query)
    cursor.execute(loading_query)

    con.close()    
except Exception as e:
    print('Error: {}'.format(str(e)))
    sys.exit(1)



