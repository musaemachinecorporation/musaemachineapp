# musaemachineapp
Currently in an alpha state
Adding features daily...

version alpha-008



Install On Ubuntu 15.10

crl + alt + t 
sudo apt-get install maven openjdk-7-jdk chrome
mvn appengine:devserver -Pdevserver
google-chrome http://localhost:8080

assets folder has all the js.  Most of the code is in daw.

index.ftl.html file is in views/ApplicationController
	where the daw's html is located

defaultLayout.ftl.html file is in views/layout
	where the file layout and include css files are

Audio.java AudioController.. have the data stored in the database.

It has a few test cases to make sure the server works on appengine
