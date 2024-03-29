# About # 
This is an attempt to show the basics of test automation on varying test levels. It uses a container to ensure that all dependencies are installed and configured.

For more detailed information on testing, refer to the subdirectories within /test-automation-training/. More detailed information and potential follow-up steps will be explained in their respective category.

Note: this is my first time creating and using a containerized development environment. If you have any feedback or notice inconsistencies please inform me. More general feedback is also appreciated. If there are things which you find unclear feel free to reach out so I can make the changes.

# Installation # 

## Requirements ##
Installation procedures are all based on windows.

On various occasions you will need to open the command prompt to execute certain commands. You can find this by searching 'command prompt' in the windows search bar
and opening it here. 

### Git ###
Git is used for version control and sharing such versions with others. Often git is used in tandem with a hosted service
such as Github. This is a centralized repository where code can be hosted and others can make changes, view your changes or 
download your code.

Version control can be helpful if your latest change breaks your program or tests entirely. With version control, the old 
version of your program still exists and you can see the differences to see what caused the issue.

Verify if git is installed via `git --version` in the command prompt.

If the program is not recognized, install the git bash terminal via: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git.

#### Github ####
This is an online website where you can save your code. A github account is required and can be made on: https://github.com. 

### Node ###
Node is a runtime environment for javascript programs. It allows for asynchronous execution of functions present in a file. This means for example, that all the endpoints specified in the file can be called independently and at the same time. This allows for the generation of dynamic web page content. (verify this explanation)

Verify if node is installed via `node --version`.

If node is not installed, you can install it via: https://nodejs.org/en/download.

### Docker ###
Docker allows you to run software in isolated 'containers'. This means that the code is sharable with others as well as ensuring a higher likelyhood of the code 
functioning exactly the same on other machines. For our purposes, we will build the containers from the code, and let docker run this software as containers automatically.

Install docker client via https://docs.docker.com/desktop/install/windows-install/. 

### IDE ###
An IDE (integrated development environment) is a text editor specifically oriented toward programming. Whereas word has helpful features for writing essays, IDEs like
visual studio code help you program more easily. 

An often used IDE which has support for many languages and frameworks is visual studio code. Download it from here: https://code.visualstudio.com

#### VS Code Plugins ####
To install plugins you can find the extensions tab on the left hand side of the screen. You will need to search for and open the following extensions:

- Jupyter extension

### Python ###
Ensure python is installed. This is a often used scripting language which we will use for various purposes. It has easy to learn syntax and a large community. So any issues which might arise have very likely been solved before.

#### Jupyter Notebook ####
Notebooks are a great way to display information and interactively code along. It does not necessarily reflect a real life example of how you would execute scripts but it is a good way for me to display information and code.

pip install jupyter
pip install ipykernel

press ctrl+shift+p and search for select interpreter to start jupyter server and select the python executable.

## Installation Procedures ##

### Repository ###
Respository: 
Fork and then clone the repository locally so you can make alterations along the way.

Fork the repository in your browser. More information can be found here: .

After forking, copy the link of the repository by clicking the '' button and copying the https link ending with .git (we will not be dealing with ssh keys). 

Open a terminal and move toward the directory where you would like the project to reside. For example, if I want it to be in `C:/Users/Luuk/Documents/Programs`, depending on where I am currently (you can see it on the left of the terminal, or you can type `cd` to print the current working directory), I would type `cd Documents/Programs` (the windows command prompt autocompletes file and directory names when using tab). If the `Programs` directory does not exist yet you can type `mkdir Programs` and subsequently do `cd Programs`. Cd stands for change directory. 

We can now clone the repository via: 
`git clone <repository-url>.git`
Pasting in the terminal (especially linux terminals) can be done via right-clicking inside the terminal.

The repository should now be downloaded. When you type `dir` you can see all the given files and directories inside your current working directory. `cd` into the newly created directory and type `code .`. This will open the project inside Visual Studio Code. Now you are ready to begin!

## Working with material ##
Where possible I tried to implement workbooks which (should) make it easier to follow along and build on your programs incrementally. If not possible I am working with code comments to further outline the steps to be taken via code comments. 

### Containers ###
Ensure that the Docker Desktop program is running when doing anything with docker.

#### .env file
Some (normally) sensitive information is stored in the .env file. 
Create a ".env" file in the root directory of your project with the following info:

MYSQL_DATABASE=ta_test_db
MYSQL_USER=testuser
MYSQL_PASSWORD=testpw
MYSQL_ROOT_PASSWORD=rootpw
MYSQL_PORT=3306

#### Building images ####
As the images are not (yet) hosted in the docker marketplace, the images will have to be built in order for the project to run.

Build the separate images by opening a terminal, and changing the directory. 

First we will build the backend image: `cd ./local-app/express-backend/`. Then we will run the docker build command to generate an image from the code. Building an image takes name, tag and directory as inputs. Ensure the name and tag are the same as in the `docker-compose.yml` file for later steps to succeed. You can just copy and paste this code:
`docker build -t backend-image:0.5 .`

For the frontend image we will also change directories to be inside the react project. Run `cd ..` to go back one directory, then `cd ./react-frontend` to change the directories where we need to go. As with the backend image, the frontend image has to have the same name and tag. Copy and paste the following command:
`docker build -t frontend-image:0.2 .`

Now the images are ready to be run as containers!

#### Running containers from the images #### 
Via docker-compose we can run several images at once. Ideal if you have separate services like in our situation with a frontend, backend and database.


Run containers
` docker-compose -f ./docker-compose.yml up`

We can run the containers as a background process so we dont have to keep a terminal open by adding the tag `-d` to the docker-compose command. However, it can be helpful to what is going on in the terminal to see if any errors come up.

Now you should be able to http://localhost:3000 to play around with the website. The backend API is running on port 3002 and the mysql server on port 3306.

#### Stopping the web app ####
When you are done with web app and wish to close all the services you can simply run `docker-compose -f ./docker-compose.yml down`.


## Making alterations in the webapp ##
If you do decide to make alterations to the webapp you need to rebuild the images. This can be done by going to the respective directory and building via
`docker build -t <image-name>:tag .`
Then adjust the docker-compose.yml file to reflect the new image. Rerun the compose file to reflect the changes.

remove volume. Especially relevant for DB which will save items and not reinitialize if you dont remove it
`docker-compose -f docker-compose.yml down -v`

### Running services separately ###
I run the services separately and manually when working on the webapp, so i dont have to rebuild the image every time. When i am finished I will rebuild the images.

If you are running the services separately as containers you can stop containers via `docker stop {container-name}`. You can find the running contains via `docker ps`.

#### Database ####
As the database is basically the image with no other local files you need to run this as a docker container during development anyhow. Run the following command:

`docker-compose -f docker-compose-dev-mysql-only.yml up --build` for fresh build with new database initialization

#### Backend ####
`cd local-app\express-backend`
`node express.js`

#### Frontend ####
`cd local-app\react-frontend`
`npm run start`


# Notes #

# Troubleshooting #

## Using installed programs ##
If you are having trouble executing for example python or node from the command line or in your scripts, ensure that the program is in the path. While you can also supply the absolute path to an executable (i.e. python, npm) this is cumbersome and can lead to errors in replicability when sharing code. Therefore you can add the programs to your path. The path environment variable is a collection of locations where executables or programs are found. When executing, for example, `python` in the command prompt, the system will look through the path to see if it can find an executable that matches your command. This way you can execute your tasks far more efficiently.

To add programs to your path you need to go to 'Edit the system environment variables' screen in windows, click on 'Environment Variables', and locate the 'Path' variable inside the 'User variables' table. You click on edit after selecting Path and create a new entry with the absolute path to the executable you want to add. For python that could be: `C:\Users\luuks\AppData\Local\Programs\Python\Launcher\`. 

## MySQL database ##

Connect to mysql database from windows cli (mysql has to be added to path):
` mysql -h localhost -P 3306 -u testuser -p`. When prompted insert pw from .env file.

inspect user table mysql
```mysql -u {user} -p```
`
USE mysql;
SELECT user, host FROM user;`

Check if mysql is running
``` service mysql status ```

After update to the mysql database run in the same directory while the contianer is still running:
`docker-compose down -v`
Then run: 
`docker-compose -f ./docker-file/ up --build`

## Container ##
Find container IP:

``` docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_id> ```

Errors may be caused by a full root partition. (after 2 days of trying cleared 16gb - good idea to keep doing this). Errors include 'x package not signed' apparently.

Removes all containers so be careful:

`docker system prune --force`

`docker volume prune --force`

Alternatively run `apt clean`. Havent tried the effect of this.