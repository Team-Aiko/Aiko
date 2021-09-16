-- WE DON'T SET ACTUAL FOREIGN KEY, BUT WE CONSIDER FOREIGN KEY CONCEPTS DUE TO PROCESS SPEED

-- USER TABLE
create table USER_TABLE (
	USER_PK INT primary key auto_increment,
	NICKNAME VARCHAR(20) unique,
	PASSWORD VARCHAR(512) not null,
	SALT VARCHAR(128) not null,
	FIRST_NAME VARCHAR(20) not null,
	LAST_NAME VARCHAR(20) not null,
	EMAIL VARCHAR(100) not null,
	TEL VARCHAR(30) not null,
	COUNTRY INT not null,
	CREATE_DATE INT not null,
	IS_DELETED INT not null default 0,
	IS_VERIFIED INT not null default 0,
	COMPANY_PK INT,
	DEPARTMENT_PK INT,
	PROFILE_FILE_NAME VARCHAR(2000)
);

-- COMPANY TABLE
create table COMPANY_TABLE (
	COMPANY_PK INT primary key auto_increment,
	COMPANY_NAME VARCHAR(60) not null,
	CREATE_DATE INT not null
);

-- COUNTRY TABLE
create table COUNTRY_TABLE (
	COUNTRY_PK INT primary key auto_increment,
	COUNTRY_NAME VARCHAR(100) not null
);

-- TEST COMPANY LIST
insert into COMPANY_TABLE (COMPANY_NAME, CREATE_DATE) values ('A', 10000);
insert into COMPANY_TABLE (COMPANY_NAME, CREATE_DATE) values ('AB', 10000);
insert into COMPANY_TABLE (COMPANY_NAME, CREATE_DATE) values ('AC', 10000);
insert into COMPANY_TABLE (COMPANY_NAME, CREATE_DATE) values ('B', 10000);
insert into COMPANY_TABLE (COMPANY_NAME, CREATE_DATE) values ('C', 10000);

-- TEST COUNTRY LIST
insert into COUNTRY_TABLE (COUNTRY_NAME) values ('US');
insert into COUNTRY_TABLE (COUNTRY_NAME) values ('Japan');
insert into COUNTRY_TABLE (COUNTRY_NAME) values ('China');
insert into COUNTRY_TABLE (COUNTRY_NAME) values ('Korea');
insert into COUNTRY_TABLE (COUNTRY_NAME) values ('UK');
insert into COUNTRY_TABLE (COUNTRY_NAME) values ('France');
insert into COUNTRY_TABLE (COUNTRY_NAME) values ('Brazil');