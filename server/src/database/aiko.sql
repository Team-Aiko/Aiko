create table USER_TABLE (
	USER_PK INT primary key auto_increment,
	NICKNAME VARCHAR(20) unique,
	FIRST_NAME VARCHAR(20) not null,
	LAST_NAME VARCHAR(20) not null,
	EMAIL VARCHAR(100) not null,
	TEL VARCHAR(30) not null,
	COUNTRY VARCHAR(60) not null,
	CREATE_DATE INT not null,
	IS_DELETED INT not null default 0,
	COMPANY_PK INT,
	DEPARTMENT_PK INT,
	PROFILE_FILE_NAME VARCHAR(2000) not NULL
);