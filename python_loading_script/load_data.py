import pymysql
import re
import sys
import csv

# GLOBALS
global columns
global final_str
global password
# leo pc password
password = 'password'
# nikos pc password
# password = 'db@cs.uoi2019'
columns = ''
final_str = ''


def csv_to_mysql(sql_command):
    """This function load a csv file to MySQL table according to
    the sql_command statement."""
    try:
    
        con = pymysql.connect(host='127.0.0.1', user='root', password=password, autocommit=True, local_infile=1)
        print('Connected to DB: {}'.format('127.0.0.1'))
        # Create cursor and execute Load SQL
        cursor = con.cursor()
        cursor.execute("USE testdb;")
        cursor.execute("CREATE TABLE data("+final_str+",id INT NOT NULL AUTO_INCREMENT,primary key (id))")
        cursor.execute(sql_command)
        print('Successfully loaded the table from csv.')
        con.close()
        
    except Exception as e:
        print('Error: {}'.format(str(e)))
        sys.exit(1)


def create_command():
    global columns
    global final_str
    count = 0
    with open('/Users/leonidas/desktop/normalized_csvs/final.csv', 'r') as csvFile:
        reader = csv.reader(csvFile)
        for row in reader:
            columns = row
            break
    csvFile.close()
    for a in columns:
        if count >= 2:
            final_str = final_str + a + " VARCHAR(30),"
        else:
            final_str = final_str + a + " VARCHAR(30),"
        count += 1
    final_str = final_str[:-1]

    s = "("
    for a in columns:
        s = s + a +","
    s = s[:-1] 
    s = s + ")"

    '''local variable must be set to 1 like this: 
    mysql> set global local_infile = 1;
    check if this is applied with:
     mysql> show variables like "local_infile";
     the file that must be uploaded must be at the mysql secured upload file directory
     you can check which directory is that by
     mysql>show variables like "secure_file_priv";
     if you want to change it or disable it you can find 
     the my.ini file inside the 
     C:\ProgramData\MySQL\MySQL Server 8.0 and change the like: secure-file-priv=""
     this can fuck up the mysql server if its running. if the server cant start
     a complete re-install and DELETING the MySQL80 service after uninstalling is required.
     this can be done with sc.exe delete MySQL80 in any cmd running as an administrator.
     after this we can re install the sql server and he can run again normally.
     also this command where useful
     ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
     '''
    
    sql_query = """LOAD DATA LOCAL INFILE "/Users/leonidas/desktop/normalized_csvs/final.csv" 
    INTO TABLE data
    FIELDS TERMINATED BY ',' 
    ENCLOSED BY '"' 
    LINES TERMINATED BY '\n'
    IGNORE 3 ROWS
    """+s+";"
    return sql_query


# Execute


csv_to_mysql(create_command())
