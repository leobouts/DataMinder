import numpy as np
import pandas as pd
import shutil
import time
import os
import csv


def main():
    global country_list
    global files
    global min_date
    global max_date
    global date_list
    global directory
    global new_directory_path
    global normalized_files
    global split_character
    global final_name
    min_date = 3000
    max_date = 0
    country_list = []
    date_list = []


    # ===========IMPORTANT=======> DATA DIRECTORY MUST BE OUTSIDE THE SCRIPT DIRECTORY
    # ===========IMPORTANT=======> NEW DATA PATH MUST BE OUTSIDE THE SCRIPT AND DATA DIRECTORY

    # directory of the data you want to normalize
    #OSX OR LINUX PATH------------>
    directory = '/Users/leonidas/desktop/data'
    #WINDOWS PATH------------>
    #directory = 'C:\\Users\\leo\\Desktop\\Data'


    # directory of the new normalized data
    #OSX OR LINUX PATH------------>
    new_directory_path = "/Users/leonidas/desktop/normalized_csvs/"
    #WINDOWS PATH------------>
    #new_directory_path = "C:\\Users\\leo\\Desktop\\normalized_csvs\\"

    # SPLIT CHARACTER

    #FOR OSX OR LINUX
    split_character ="/"
    #FOR WINDOWS
    #split_character = "\\"

    #final name
    #osx or linux
    final_name = "/final.csv"
    #windows
    #final_name = "\\final.csv"


    print("================NORMALIZING DATA SCRIPT================")
    clean_directory(new_directory_path)
    #try:
    files = get_list_of_files(directory)
    get_all_countries_and_dates()
    date_list = create_list_with_years()
    # print(min_date)
    # print(len(country_list))
    country_list.pop(0)
    normalize_csvs()
    normalized_files = get_list_of_files(new_directory_path)
    fill_csv_blanks()
    prepare_final_csv_for_loading()
    print("finishing...")
    time.sleep(1)
    print("[OK]")

    '''except:
        print(e)
        print("~~~~~~~EXECUTION ERROR")
        print("please close all the old normalized .csv files before running the script")
        print("and check for the correct data paths")
        print("NOTE: normalized directory must not be inside the data directory.")
        print("If this dont work contact the script maker")
        quit()'''


# finds the total minimum and maximum year from every csv and all the countries that are being referenced


def get_all_countries_and_dates():
    global country_list
    global files
    global min_date
    global max_date
    for f in files:
        row_counter = 0
        with open(f, 'r') as csvFile:
            reader = csv.reader(csvFile)
            a = f.split('.')
            # check only for csv files in the directory
            if a[1] == "csv":
                for row in reader:
                    row_counter += 1
                    if row_counter == 1:
                        check_current_min = int(row[1])
                        check_current_max = int(row[-1])
                        if check_current_min < min_date:
                            min_date = check_current_min
                        if check_current_max > max_date:
                            max_date = check_current_max
                    if not row[0] in country_list:
                        country_list.append(row[0])
        csvFile.close()
    # clean the countries from commas because is used as a delimiter
    for i in range(0, len(country_list)):
        if "," in str(country_list[i]):
            a = country_list[i].split(",")
            country_list[i] = a[0] + " - " + a[1]


# lists all the files in this directory and subdirectory


def get_list_of_files(directory_name):
    # create a list of file and sub directories
    # names in the given directory
    list_of_file = os.listdir(directory_name)
    all_file = list()
    # Iterate over all the entries
    for entry in list_of_file:
        # Create full path
        full_path = os.path.join(directory_name, entry)
        # If entry is a directory then get the list of files in this directory
        if os.path.isdir(full_path):
            all_file = all_file + get_list_of_files(full_path)
        else:
            all_file.append(full_path)

    return all_file


def create_list_with_years():
    global min_date
    global max_date
    first_row = []
    for x in range(min_date, max_date):
        first_row.append(x)
    return first_row


def normalize_csvs():
    global country_list
    global files
    global date_list
    global data
    global columns
    global rows
    global min_date_current
    global max_date_current
    global directory
    global new_directory_path
    global split_character

    for f in files:
        print("Now processing file: "+f+" ...")
        time.sleep(0.3)
        with open(f, 'r') as csvFile:
            reader = csv.reader(csvFile)
            a = f.split('.')
            if not a[1] == "csv":
                print("non csv file: "+f)
                print("skipping .....")
                continue
            data = list(reader)
            data_as_numpy_array = np.array(data)
            rows = data_as_numpy_array.shape[0]
            columns = data_as_numpy_array.shape[1]
            min_date_current = int(data[0][1])
            max_date_current = int(data[0][columns-1])
            date_to_add = int(min_date)
            position = 1
            while date_to_add < min_date_current:

                for y in range(0, rows):
                    if y == 0:
                        data[y].insert(position, date_to_add)
                    else:
                        data[y].insert(position, "")
                date_to_add = date_to_add + 1
                position = position + 1

            date_to_add = max_date_current + 1
            ''' adding 5 to the position one for the 'column' at 0,0 of the data array and 2 
            for the minimum and maximum that are being passed 2 times. 1+2+2'''
            position = max_date_current - min_date + 5
            while date_to_add <= int(max_date):
                for y in range(0, rows):
                    if y == 0:
                        data[y].insert(position, date_to_add)
                    else:
                        data[y].insert(position, "")
                date_to_add = int(date_to_add) + 1
                position = position + 1
            # clean the countries from commas because is used as a delimiter
            for g in range(0, len(data)):
                if "," in str(
                        data[g][0]):
                    a = str(data[g][0]).split(",")
                    data[g][0] = a[0]+" - "+a[1]

            # take again rows and columns because the dimensions changed

            data_as_numpy_array = np.array(data)
            rows = data_as_numpy_array.shape[0]
            columns = data_as_numpy_array.shape[1]

            # create new object with copy, python uses something like reference
            country_list_copy = country_list.copy()
            list_to_add_null_values = []
            for y in range(0, rows):
                if data[y][0] in country_list:
                    country_list_copy.pop(country_list_copy.index(data[y][0]))

            for x in country_list_copy:
                list_to_add_null_values.append(x)
                for j in range(1, columns):
                    list_to_add_null_values.append("")
                data.append(list_to_add_null_values)
                list_to_add_null_values = list()

            data_as_numpy_array = np.array(data)
            name = f.split(split_character)
            file_name = new_directory_path + "normalized " + name[-1]
            np.savetxt(file_name, data_as_numpy_array, fmt='%s', delimiter=",")
            sort_by_countries(file_name)


def prepare_final_csv_for_loading():
    global country_list
    global files
    global date_list
    global data
    global columns
    global rows
    global min_date_current
    global max_date_current
    global directory
    global new_directory_path
    global split_character
    global final_name
    final_writing_list = []
    file_flag = 1
    columns_list = ["country", "year"]
    type_column = ["type","nan"]
    measure_column = ["measure","nan"]
    for f in normalized_files:
        with open(f, 'r') as csvFile:
            reader = csv.reader(csvFile)
            a = f.split('.')
            check_type = a[0].split('+');
            type_column.append(check_type[2])
            measure_column.append(check_type[1])
            if not a[1] == "csv":
                print("non csv file: "+f)
                print("skipping .....")
                break
            data = list(reader)
            data_as_numpy_array = np.array(data)
            rows = data_as_numpy_array.shape[0]
            columns = data_as_numpy_array.shape[1]
            temporal_list = []
            for i in range(0, rows):
                for j in range(0, columns):
                    if i != 0 and j != 0:
                        temporal_list.append([data[i][0], data[0][j], data[i][j]])
            np.savetxt(f, np.array(temporal_list), fmt='%s', delimiter=",")

    for f in normalized_files:
        with open(f, 'r') as csvFile:
            reader = csv.reader(csvFile)
            a = f.split('.')
            if not a[1] == "csv":
                print("non csv file: " + f)
                print("skipping .....")
                break
            # print(data)
            data = list(reader)
            data_as_numpy_array = np.array(data)
            rows = data_as_numpy_array.shape[0]
            columns = data_as_numpy_array.shape[1]
            if file_flag == 1:
                for i in range(0, rows):
                    for j in range(0, columns):
                        if j != 0 and j != 1:
                            final_writing_list.append([data[i][0], data[i][1], data[i][j]])
                file_flag = 2
            else:
                for i in range(0, rows):
                    final_writing_list[i].append(data[i][2])
            name = f.split(split_character)
            nameSplitted = name[-1].split("+")
            nameSplitted = nameSplitted[0].split(" ")
            columns_list.append(nameSplitted[1])

    #if you want to insert a new row in the final matrix just do final_writing_list.insert(position, row_you_want)
    final_writing_list.insert(0, columns_list)
    final_writing_list.insert(1, type_column)
    final_writing_list.insert(2, measure_column)

    # this loop creates a COLUMN you want to add.
    
    '''for i in range(0, rows+3):
        if i == 0:
            final_writing_list[i].append("id")
        else:        
            final_writing_list[i].append("NULL")'''
    
    np.savetxt(new_directory_path + final_name, np.array(final_writing_list), fmt='%s', delimiter=",")


# fill empty blanks of a csv


def fill_csv_blanks():
    global normalized_files
    global split_character
    for f in normalized_files:
        df = pd.DataFrame(list(csv.reader(open(f, "r"))))
        df.replace('', np.nan, inplace=True)
        data_as_numpy_array = np.array(df)
        name = f.split(split_character)
        file_name = new_directory_path + name[-1]
        np.savetxt(file_name, data_as_numpy_array, fmt='%s', delimiter=",")


# removes old csv data created by this script to avoid confusion


def clean_directory(removal_path):
    print("preparing data with love, standby...")
    time.sleep(2)
    try:
        shutil.rmtree(removal_path)
        print("Old data found.")
        time.sleep(0.3)
        print('Cleaning up the directory..')
        time.sleep(0.6)
        os.makedirs(os.path.dirname(removal_path), exist_ok=True)
        print('[OK]')
        time.sleep(0.5)
    except OSError:
        print("No old data found.")
        time.sleep(0.3)
        print('Creating the directory..')
        time.sleep(0.6)
        os.makedirs(os.path.dirname(removal_path), exist_ok=True)
        print('[OK]')
        time.sleep(0.5)


# after normalizing the file is sorted by its country so every csv have tha same form


def sort_by_countries(file_name):
    with open(file_name, 'r', newline='') as f_input:
        csv_input = csv.DictReader(f_input)
        sorted_data = sorted(csv_input, key=lambda row: (row['country']))

    with open(file_name, 'w', newline='') as f_output:
        csv_output = csv.DictWriter(f_output, fieldnames=csv_input.fieldnames)
        csv_output.writeheader()
        csv_output.writerows(sorted_data)


# Execute


main()
