# Keyword searching api upon user request.

Upon the search keyword user can get all matches posts as response from this [External IP](https://jsonplaceholder.typicode.com/posts).

## Table of Contents

-   [Installation](#installation)
-   [Features](#features)
-   [Usage](#usage)

## Installation

This project is built by Express.js (A Node.js framework) along with Typescript. However, the necessary packages are _axios, bcrypt, cookie-parser, cors, dotenv, express, express-rate-limit, helmet, ip, jsonwebtoken, mysql2_. Run <span style="color:blue;">`npm install`</span> in the terminal.

## Features

MySQL is being used in this project where there are total three tables - <span style="color:blue;">`users`</span>, <span style="color:blue;">`search_actions`</span>, <span style="color:blue;">`match_results`</span>

Before running the server, you need to create database and the tables. Assuming the database name is test. Go to terminal and enter MySQL console by typing <span style="color:blue;">`mysql -u root -p`</span> and write down your password. Change the username if needed accordingly. Now look at the SQL commands:

```bash
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE search_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  ip_addr VARCHAR(45) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  timestamp DATETIME NOT NULL
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE match_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  search_action_id INT NOT NULL,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  FOREIGN KEY (search_action_id) REFERENCES search_actions(id)
);
```

**Note**: There is **One to Many** relations between <span style="color:blue;">`users`</span> and <span style="color:blue;">`search_actions`</span> table as well as <span style="color:blue;">`search_actions`</span> table and <span style="color:blue;">`match_records`</span> table.

## Usage

Below three APIs are available:

-   [localhost:3000/users/signup](http://localhost:3000/users/signup)
-   [localhost:3000/users/signin](http://localhost:3000/users/signin)
-   [localhost:3000/search?keyword=mango](http://localhost:3000/search?keyword=mango)

User can use the last API without being authenticated or can create account. Login user will receive jwt and further API request and their data will be stored in the database referencing by their **unique id**. For public user the id will set to **NULL**.
So that, all searches actions can get by joining with all related match records. Besides, a authenticated user's search records can also get and the system can track **IP addresses** for search analysis.
