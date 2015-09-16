# I Know Someone Portal Website

**Working name:** *IKS Portal*

**Author:** *Andrew MacCuaig*

*Tested using Chrome and Firefox*

**Known bugs:**

- Datepicker doesn't always show up in Chrome

**Note:** Minified and unminifed versions of my javascript and css files have been included. To debug just switch to the unminified version of the file in the jade template.

## Setting up Git environment

```
$ git remote add origin https://github.com/st-andrew/IKS-Portal.git
$ git fetch origin
$ git pull origin master
```

## Helper Commands

Fix line endings

```
$ find . -type f -exec dos2unix {} +
```

Automatically remove deleted files from Git

```
git add -u
```

## Starting the server

#### Start the server in development mode

1 - In app.js comment out the line that sets the 'env' variable to 'production'

2 - Start the server by running

```
$ node app.js
```

#### To start the server in production mode

1 - Uncomment the line that sets the 'env' variable to 'production' in app.js

2 - Start the server by running

```
$ node app.js
```
