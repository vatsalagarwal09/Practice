CREATE DATABASE feemanagementdb;

CREATE TABLE student
(
    id INT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    father_name VARCHAR(255),
    address VARCHAR(255),
    dob DATE,
    doa DATE,
    sem INT,
    year INT,
    branch_id INT,
    class VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    phone INT
);

CREATE TABLE admin
(
    id INT PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
);


CREATE TABLE payment_data
(
    payment_id INT PRIMARY KEY,
    student_id INT,
    /* check how to make a foreign key*/
    course_id INT,
    year INT,
    tution_fees FLOAT,
    transport_fees FLOAT,
    hostel_fees FLOAT,
    discount FLOAT,
    fine_id INT,
    due_date DATE,
    haspaid BOOLEAN,
    total_fees FLOAT
);
CREATE TABLE receipt
(
    receipt_no varchar PRIMARY KEY,
    student_id int,
    student_name varchar,
    Payment_Date varchar,
    Payment_Amount varchar
);

SELECT *
FROM student
WHERE email = 'user_email';