# Visualising Data with Angular and ngx-charts using NodeJS and MySQL

[![Go to the profile of Leonidas Boutsikaris](https://cdn-images-1.medium.com/fit/c/100/100/2*ucX4eft2_64A13VDzZQU_g.png)](https://medium.com/@leobouts)

[Leonidas Boutsikaris](https://medium.com/@leobouts)

Apr 24

### Introduction

Data visualisation is used to display data in a way that one can identify patterns and relationships between them. In this article i will explain how i created an application that creates timeline, bar and scatter graphs from the [Gapminder](https://www.gapminder.org) dataset.

> Note: The point of the article is not to explain how to create an angular app and how the angular framework works but to display the approach i took during the development of this project. The article will be updated with more info and comments and later the whole process of setting up the Angular app with a link to the complete working code of the App on github.

### Designing the database

Database design is the organization of data according to a database model. At first we must take into consideration how our csv data is structured. A CSV (Comma-Separated Values) is a delimited text file that uses a comma to separate values. A CSV file stores tabular data (numbers and text) in plain text. The gapminder dataset includes various data with indexes ranging from economics to health and infrastructure. You can browse the datasets [here](https://www.gapminder.org/data/).

Gapminder csv files have a certain format. Every column represents a year and every row a country. Combining the index of these two we get the value we want for a certain year for a certain country.

![small portion of the Life Expectancy (years) dataset](https://cdn-images-1.medium.com/max/1600/1*l4ZYED2uPSHTXu8Ujk_b2g.png)
small portion of the Life Expectancy (years) dataset

What if we wanted to get a dozen of different datasets? We have to normalize our data. Before that we will talk about the database schema. The term “schema” refers to the organization of data as a blueprint of how the database is constructed (divided into database tables in the case of relational databases).

When designing the database schema there is always a tradeoff. We could use multiple tables that will make our queries faster but this will result in more complicated relational algebra questions. In the other hand we could use a single table that will surely slow us down ( won’t matter in small datasets like ours) but will make our life easier.

Our database will contain 2 tables. The first table will be called “data” and as the name suggests will store all the available data. With the first and second column we can create all the possible combinations for every year and every country available. Every other column will store the index value.

![Figure1. The data table format](https://cdn-images-1.medium.com/max/1600/1*KoYkcwSrWpn5J5q7b2fBoQ.png)
Figure1. The data table format

The second table will be a helper table containing the name of the index the measurement and its type. For example _yearly co2 emissions_ could be measured with _co2 per 1000 tonnes._ The type of every index is an addition for comparison graphs. What if we want to create a scatter plot graph? We will choose which indexes can be served as a generic type so we can compare them with the other available data. For example the gdp (Gross domestic product) is a good comparison index. We can find patterns or trends in the market value of all final goods and services from a nation in a given year compared to the values of unemployment or any other metric.

Be careful, Correlation does not imply causation. For example, the number of people who drowned by falling into a swimming pool correlates with the number of films Nicolas Cage appeared in ([source](http://www.tylervigen.com/view_correlation?id=359)). Does people drowning in swimming pools have something to do with Nicolas Cage appearances? Probably not.

### Preparing the data

Right now we are stuck with some CSV files that don’t have the same years and countries. Lets work it out with python. We will use a filename convention to automate things a bit. Every CSV dataset that will be normalised will have follow this format:

> index\_name+measurement\_type+type.csv

for example:

> oil\_consumption\_per\_cap+tones\_per\_year\_per\_person+specific.csv

The filenames must be initialised by hand.The measurement type for every dataset is displayed on the gapminder page of the respective dataset. The type of the dataset is chosen by us so there is no way to automate this step. Below with a diagram we can see the normalising process. In our case we have chosen 12 csv files.

![The process of normalising the csv files](https://cdn-images-1.medium.com/max/1600/1*a6uVTPFGMu0kdGtjdGRnTQ.png)
The process of normalising the csv files

NOTE: PLEASE REFER TO THE PYTHON CODE. CODE SNIPPETS WONT APPEAR ON THE GITHUB README PAGE.


### Setting up and Filling the database

First you have to set up MySQL on your machine. MySQL is available for downloading [here](https://dev.mysql.com/downloads/mysql/). The default settings on the installation guide will do.

The only thing you need to set is a password. No Guis here, let the code speak. We will use the [LOAD DATA INFILE](https://docs.oracle.com/cd/E17952_01/mysql-5.0-en/load-data.html) command . This works efficiently with large datasets. MySQL complains a lot when we try to add data like this so we will adjust some settings to work this out. The local variable must be set to 1 like this:

> _mysql> set global local\_infile = 1;_

You can check if this is applied like this:

> mysql> show variables like “local\_infile”;

The final csv file that will be uploaded must be at the mysql secured upload file directory, you can check which directory is that with:

> mysql>show variables like “secure\_file\_priv”;

> For windows users

If you want to change it or disable it you can find the my.ini file inside the   
 _C:\\ProgramData\\MySQL\\MySQL Server 8.0_ and change the line: _secure-file-priv=” ” . T_his can mess up the mysql server if its running. If the server cant start after this a complete re-install and DELETING the MySQL80 service after uninstalling is required. (This can be done with “_sc.exe delete MySQL80”_ in any cmd running as an administrator.) After this we can re install the sql server and then it can run again normally.

We also need to run this command:

> ALTER USER ‘root’@’localhost’ IDENTIFIED WITH mysql\_native\_password BY ‘password’

Finally lets install the pymsql library and start loading the data.

> \> python3 -m pip install PyMySQL

### Setting up the server

After the database is ready we need someone to serve the data to our app. We will use NodeJS for setting up the server. Node is available for downloading [here](https://nodejs.org/en/download/). You also need to install mysql, cors and express with the node package manager like this:

> \> npm install mysql

> \> npm install cors

> \> npm install express

We will create 7 different api functions. The application will call a function with its respective input. Every function will then execute a SQL command according to the input the app provided through the **_con_** variable. The data will be returned to the Node and then will be transfered back to the app through the **_cors_** connection.

Below we can see with a diagram how the whole system communicates.

![Connections between the App the server and the database](https://cdn-images-1.medium.com/max/1600/1*EDd41252FIx9hQQGihJKQQ.png)
Connections between the App the server and the database

NOTE: PLEASE REFER TO THE NODE CODE. CODE SNIPPETS WONT APPEAR ON THE GITHUB README PAGE.

> Security note: ever heard of an injection attack?

Injection attacks are very common in MySQL. When we concatenate a string with some variables and don’t bother to escape them correctly a malicious user can pass on a variable name as another SQL command. For example, instead of a country name he could use something as “DROP TABLE x” for a name query. That’s definitely not a table name. This can be done if we concatenate our strings in node like this:

_“SELECT measure FROM measures WHERE m\_index = “ + “indexname”_

> You can check out more on sql injections [here](https://blog.hailstone.io/how-to-prevent-sql-injection-nodejs/) and [here](http://www.technicalkeeda.com/nodejs-tutorials/how-to-prevent-sql-injection-in-nodejs).

### Setting up the application UI

The application will be built using Angular and Angular Material available [here](https://material.angular.io/guide/getting-started).

(Don’t forget any step in the angular material installation guide).

#### The app structure

![](https://cdn-images-1.medium.com/max/1600/1*Jphu6KJlLjgbv0TFEqzzlg.png)

Lets create a Stepper so we will have a data selection process. Steppers display progress through a sequence of logical and numbered steps. They may also be used for navigation. Steppers may display a transient feedback message after a step is saved. A stepper can be linear (steps must be taken in the same order) or not, editable(previous steps editable) or not and also horizontal or vertical.

_Our Stepper will look like this:_

![](https://cdn-images-1.medium.com/max/1600/1*VXK9DfzTfs5nhbUqp-joyQ.png)

we will first create a stepper tag. Our stepper is vertical and has a linear mode enabled. All our steps will be inside the vertical stepper tag.

NOTE: PLEASE REFER TO THE ANGULAR CODE. CODE SNIPPETS WONT APPEAR ON THE GITHUB README PAGE.

Lets take a look at our first step. The editable attribute says that we cant edit this step if it is completed. The completed attribute is a boolean variable controlled by the typescript file of this Angular component. When the user clicks the Begin button the getIndexes function will make the boolean variable step0 true.

> note: Everything that contains the “mat” keyword is an Angular material object that can be either a dropdown menu, a button, etc, you can find everything in their documentation [here](https://material.angular.io/components/categories).

After the getIndexes function returns our data, the second step will display dynamically the returned available indexes from our database. (we will talk about that later).

Lets look at the second step. Here we introduce a new attribute. A formControl attribute that controls the inputs the user selected. The multiple keyword inside the mat-select is defining that the user can choose more than one options in the dropdown selection form. The code inside the </span> tag is just UI candy when selecting more than one options. The l1 list holds the indexes returned from the database. The label attribute is the value displayed in the dropdown form. The filteredMetrics list contains all the metrics only once but in the same order that the indexes are stored in the l1 list. So the position of an index in the l1 list will be its metric in the filteredMetrics list. A dropdown list is displayed with them.

> Note: index refers to the index name of the dataset. Position refers to the position of something in a data structure.

In this way we can have a complex dropdown list that groups our indexes according to their measurement type we discussed in the beginning. After choosing indexes of the same measurement the appropriate function is called and returns the available countries of the selected indexes.

The same logic applies to the third step. The user here can choose one or more countries.

Now lets pick our dates. Here a label that informs the user with the available dates is displayed with the availableDatesString.

Finally lets pick if we want to group our data with 5 or 10 year periods or just display every year the user chose.

> Note: Exactly the same process is used for creating a bar graph

_A small difference in the selection process is used for scatter plot graphs. instead of one step that uses all the indexes the selection splits in two drop-downs. Remember the generic types of dataset for comparison in the beginning? this will used to group the indexes accordingly._

### Wait a second, where did those data came?

The process above uses dynamic queries to produce procedurally the desired graph. To get these data we need a data service that will talk to our node API. Angular got us covered with [injectables](https://angular.io/api/core/Injectable). Angular consists of components. Components are the building blocks of the entire application. An injectable provides services to a component.

> Note: your nodeJs server must be running the port you provide in the dataService file

NOTE: PLEASE REFER TO THE ANGULAR CODE. CODE SNIPPETS WONT APPEAR ON THE GITHUB README PAGE.

Lets look at our data service. The base url refers to the port the NodeJS application is running. Every function passes parameters as a string to a certain endpoint we created using the fetch function.

With a data service we can request the data that every step needs to continue.

For example lets take a look at the first step. All calls must be asynchronous so we are sure our data came back before rendering the next steps.

The same logic applies to every call to the API.

> Note: I found out there is a little bug in the material stepper. It somehow fixes when i add an async function after calling the stepper.next() function that makes the stepper proceed.

### Ngx-charts

Ngx-charts is using Angular to render and animate the SVG elements with all of its binding and speed goodness, and uses d3 for the excellent math functions, scales, axis and shape generators, etc. Examples of Ngx-charts can be browsed [here](https://github.com/swimlane/ngx-charts).

### Lets prepare the data for the ngx-charts

NOTE: PLEASE REFER TO THE HTML CODE. CODE SNIPPETS WONT APPEAR ON THE GITHUB README PAGE.

The timeline and bar graphs have have exactly the same data format.

We’re gonna need an interface to store the data.

Lets prepare them for the graph.

Now the scatter chart have a different data format.

And with applying the same logic you can format the data appropriately.

### The graph is hungry, lets feed it

Before that we have to define the graph options. We can adjust the size, the colours, the axis labels and much more.

After that the only thing left to do is to add the ngx tag to the appropriate html file.

Here we can see how our scatter plot will look like for some of the indexes.

![](https://cdn-images-1.medium.com/max/1600/1*dvp2hx-N3VTyRjpCqzcOcg.png)

### Summary

At first we prepared the data with some scripting automation. We then proceeded to set up the database and populate its tables. Finally we created an API so our front-end app can talk to the server, prepare the data and feed it to the graph library.

Building a complete application from scratch can be quite tedious , this forces you to learn a lot in the process. Even with a simple app you have to work with many tools before ending up with the desired outcome.
