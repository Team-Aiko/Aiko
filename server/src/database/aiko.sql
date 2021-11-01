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
	COUNTRY_PK INT not null,
	CREATE_DATE INT not null,
	IS_DELETED INT not null default 0,
	IS_VERIFIED INT not null default 0,
	COMPANY_PK INT,
	DEPARTMENT_PK INT,
	PROFILE_FILE_NAME VARCHAR(2000)
);

create table 

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

-- LOGIN AUTH TABLE
create table LOGIN_AUTH_TABLE (
	LOGIN_AUTH_PK INT primary key auto_increment,
	USER_PK INT not null,
	UUID VARCHAR(512) not null
);

-- DEPARTMENT TABLE
create table DEPARTMENT_TABLE (
	DEPARTMENT_PK INT primary key auto_increment,
	DEPARTMENT_NAME VARCHAR(60) not null,
	COMPANY_PK INT not null,
	PARENT_PK INT,
	DEPTH INT not null default 0
);

-- RESET PASSWORD TABLE
create table RESET_PW_TABLE (
    RESET_PK INT PRIMARY KEY AUTO_INCREMENT,
    USER_PK INT NOT NULL,
    UUID VARCHAR(512) NOT NULL
);

-- SOCKET TABLE
create table SOCKET_TABLE (
    SOCKET_PK INT PRIMARY KEY AUTO_INCREMENT,
    SOCKET_ID VARCHAR(512) NOT NULL,
    USER_PK INT NOT NULL
);

-- CHAT FILE TABLE
create table CHAT_FILE_TABLE (
    CF_PK INT PRIMARY KEY AUTO_INCREMENT,
    FILE_ROOT VARCHAR(2000) NOT NULL,
    CR_PK VARCHAR(256) NOT NULL
);

-- ONE TO ONE CHAT ROMM TABLE
create table ONE_TO_ONE_CHAT_ROOM_TABLE(
    CR_PK VARCHAR(256) PRIMARY KEY,
    USER_1 INT NOT NULL,
    USER_2 INT NOT NULL,
    COMPANY_PK INT NOT NULL
);

-- AUTH LIST TABLE
create table AUTH_LIST_TABLE (
    AUTH_LIST_PK INT PRIMARY KEY AUTO_INCREMENT,
    AUTH_NAME VARCHAR(64) NOT NULL
);

-- GRANT TABLE
create table GRANT_TABLE (
    GRNT_PK INT PRIMARY KEY AUTO_INCREMENT,
    USER_PK INT NOT NULL,
    AUTH_LIST_PK INT NOT NULL
);

-- ACTION TABLE
create table ACTION_TABLE (
    ACTION_PK INT PRIMARY KEY AUTO_INCREMENT,
    DEPARTMENT_PK INT NOT NULL,
    USER_PK INT NOT NULL,
    TITLE VARCHAR(128) NOT NULL,
    DESCRIPTION VARCHAR(2000),
    ASSIGNER_PK INT NOT NULL,
    IS_FINISHED INT DEFAULT 0,
    START_DATE INT NOT NULL,
    DUE_DATE INT NOT NULL,
    CREATE_DATE INT NOT NULL,
    STEP_PK INT NOT NULL,
    P_PK INT NOT NULL
);
-- STEP INDEX TABLE
CREATE TABLE STEP_INDEX_TABLE (
    STEP_PK INT PRIMARY KEY AUTO_INCREMENT,
    STEP_LEVEL INT NOT NULL,
    STEP_NAME VARCHAR(32) NOT NULL
);

-- ACTION PRIORITY TABLE
CREATE TABLE ACTION_PRIORITY_TABLE (
    P_PK INT PRIMARY KEY AUTO_INCREMENT,
    PRIORITY_NAME VARCHAR(32) NOT NULL
);



-- 리프레시 토큰 테이블 생성
create table REFRESH_TOKEN_TABLE (
	NO int auto_increment,
	USER_PK int,
	USER_TOKEN varchar(512),
	primary key (NO)
);

create table MEET_ROOM_TABLE (
    ROOM_PK INT PRIMARY KEY AUTO_INCREMENT,
    ROOM_NAME VARCHAR(32) NOT NULL,
    LOCATE VARCHAR(64) NOT NULL,
    COMPANY_PK INT NOT NULL,
    IS_ONLINE INT DEFAULT 0
);

CREATE TABLE MEET_TABLE (
    MEET_PK INT PRIMARY KEY AUTO_INCREMENT,
    TITLE VARCHAR(64) NOT NULL,
    DESCRIPTION VARCHAR(512) NOT NULL,
    MAX_MEM_NUM INT NOT NULL,
    ROOM_PK INT NOT NULL,
    DATE INT NOT NULL,
    IS_FINISHED INT NOT NULL DEFAULT 0
);

CREATE TABLE CALLED_MEMBERS_TABLE(
    CALL_PK INT PRIMARY KEY AUTO_INCREMENT,
    USER_PK INT NOT NULL,
    MEET_PK INT NOT NULL
);


-- 공지 게시판 테이블 생성
create table NOTICE_BOARD_TABLE (
	NO int auto_increment,
	TITLE varchar(80),
	CONTENT varchar(6000),
	USER_PK int,
	CREATE_DATE int,
	UPDATE_DATE int,
	IS_DELETE int,
	primary key (NO)
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

-- TEST AUTH_LIST_TABLE
insert into AUTH_LIST_TABLE (AUTH_NAME) values ('CHIEF_ADMIN');

-- TEST STEP INDEX
INSERT INTO STEP_INDEX_TABLE (STEP_LEVEL, STEP_NAME) VALUES (0, 'PENDING');
INSERT INTO STEP_INDEX_TABLE (STEP_LEVEL, STEP_NAME) VALUES (1, 'NOT STARTED');
INSERT INTO STEP_INDEX_TABLE (STEP_LEVEL, STEP_NAME) VALUES (2, 'IN PROCESS');
INSERT INTO STEP_INDEX_TABLE (STEP_LEVEL, STEP_NAME) VALUES (3, 'DONE');

-- TEST PRIORITY
INSERT INTO ACTION_PRIORITY_TABLE (PRIORITY_NAME) VALUES ('HIGH');
INSERT INTO ACTION_PRIORITY_TABLE (PRIORITY_NAME) VALUES ('MEDIUM');
INSERT INTO ACTION_PRIORITY_TABLE (PRIORITY_NAME) VALUES ('LOW');