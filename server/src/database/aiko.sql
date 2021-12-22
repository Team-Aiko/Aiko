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
	USER_PROFILE_PK INT
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

-- CHAT FILE TABLE
create table CHAT_FILE_TABLE (
    CF_PK INT PRIMARY KEY AUTO_INCREMENT,
    ORIGINAL_NAME VARCHAR(256) NOT NULL,
    FILE_NAME varchar(256) NOT NULL,
    FILE_SIZE INT NOT NULL,
    CR_PK VARCHAR(256) NOT NULL
);

-- PRIVATE CHAT ROOM TABLE
create table PRIVATE_CHAT_ROOM_TABLE(
    CR_PK VARCHAR(256) PRIMARY KEY,
    USER_1 INT NOT NULL,
    USER_2 INT NOT NULL,
    COMPANY_PK INT NOT NULL
);

-- GROUP CHAT TABLES
create table GROUP_CHAT_ROOM_TABLE (
    GC_PK INT PRIMARY KEY AUTO_INCREMENT,
    ROOM_ADMIN INT NOT NULL,
    COMPANY_PK INT NOT NULL,
    MAX_NUM INT NOT NULL,
    ROOM_TITLE VARCHAR(64) NOT NULL
);

CREATE TABLE GROUP_CHAT_USER_LIST_TABLE (
    GC_UL_PK INT PRIMARY KEY AUTO_INCREMENT,
    GC_PK INT NOT NULL,
    USER_PK INT NOT NULL
);

-- CHAT STORAGE TABLES
create table CHATLOG_STORAGE_TABLE (
    CS_PK int primary key auto_increment,
    CR_PK VARCHAR(256) NOT NULL,
    SENDER INT NOT NULL,
    CF_PK INT NOT NULL DEFAULT 0,
    MESSAGE VARCHAR(512) DEFAULT NULL,
    DATE INT NOT NULL
);

create table GROUP_CHAT_STORAGE_TABLE(
    GCS_PK int primary key auto_increment,
    CF_PK INT NOT NULL DEFAULT 0,
    GC_PK INT NOT NULL,
    SENDER INT NOT NULL,
    MESSAGE VARCHAR(512) DEFAULT NULL,
    DATE INT NOT NULL
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

create table USER_PROFILE_FILE_TABLE (
    USER_PROFILE_PK INT PRIMARY KEY AUTO_INCREMENT,
    ORIGINAL_NAME VARCHAR(256) NOT NULL,
    FILE_NAME VARCHAR(256) NOT NULL
);

-- DRIVE MODULE TABLES
CREATE TABLE FILE_FOLDER_TABLE (
    FOLDER_PK INT PRIMARY KEY AUTO_INCREMENT,
    COMPANY_PK INT NOT NULL,
    FOLDER_NAME VARCHAR(64),
    SIZE INT NOT NULL DEFAULT 0,
    PARENT_PK INT DEFAULT NULL,
    IS_DELETED INT not null default 0
);

CREATE TABLE FOLDER_BIN_TABLE (
    FOLDER_BIN_PK INT PRIMARY KEY AUTO_INCREMENT,
    USER_PK INT NOT NULL,
    COMPANY_PK INT NOT NULL,
    FOLDER_PK INT NOT NULL,
    DATE INT NOT NULL
);

CREATE TABLE FILE_KEYS_TABLE (
    FILE_KEY_PK INT PRIMARY KEY AUTO_INCREMENT,
    FOLDER_PK INT NOT NULL,
    COMPANY_PK INT NOT NULL,
    IS_DELETED INT default 0
);

CREATE TABLE FILE_HISTORY_TABLE (
    FH_PK INT PRIMARY KEY AUTO_INCREMENT,
    FILE_KEY_PK INT NOT NULL,
    USER_PK INT NOT NULL,
    ORIGINAL_FILE_NAME VARCHAR(256) NOT NULL,
    NAME VARCHAR(256) NOT NULL,
    SIZE INT NOT NULL,
    DATE INT NOT NULL
);

CREATE TABLE FILE_BIN_TABLE (
    FB_PK INT PRIMARY KEY AUTO_INCREMENT,
    FILE_KEY_PK INT NOT NULL,
    USER_PK INT NOT NULL,
    COMPANY_PK INT NOT NULL,
    DATE INT NOT NULL
);

-- 공지 게시판 테이블 생성 //수정
drop table notice_board_table ;
create table NOTICE_BOARD_TABLE (
	NOTICE_BOARD_PK int auto_increment,
	TITLE varchar(80),
	CONTENT varchar(6000),
	USER_PK int not null,
    COMPANY_PK int not null,
	CREATE_DATE int,
	UPDATE_DATE int,
	UPDATE_USER_PK int,
	IS_DELETE int,
	primary key (NOTICE_BOARD_PK)
); -- 수정자 추가


-- 공지 게시판 파일 테이블 생성 
create table NOTICE_BOARD_FILE_TABLE (
	NBF_PK int auto_increment,
	UUID varchar(128),
	NOTICE_BOARD_PK int not null,
	USER_PK int not null,
	COMPANY_PK int not null,
	ORIGINAL_NAME varchar(512),
	IS_DELETE int not null,
	primary key(nbf_pk)
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


-- 전자결제 

create table APPROVAL_FRAME_TABLE (
AF_PK int auto_increment,
USER_PK int not null,
TITLE varchar(80) not NULL,
CONTENT VARCHAR(6000) not NULL, 
COMPANY_PK int not null,
AC_PK int not null,	
DEPARTMENT_PK int not null,
CURRENT_STEP_LEVEL int not null,
AS_PK int not null,
START_DATE int not null,
END_DATE int,
primary key(AF_PK)
);

create table APPROVAL_STEP_TABLE (
AS_PK int auto_increment,
USER_PK int not null,
STEP_LEVEL int not null,
DECISION int not null,
SIGN_DATE int,
primary key(AS_PK)
);

create table APPROVAL_CATEGORY_TABLE (
AC_PK int auto_increment,
CATEGORY_NAME varchar(80),
CREATE_DATE int,
primary key(AC_PK)
);


create table STATUS_CODE_TABLE (
STATUS_CODE_PK int auto_increment,
INDEX_TB varchar(60) not null,
COLUMN_NAME varchar(60) not null,
CODE int not null,
DESCRIPTION varchar(128),
CREATE_DATE int,
UPDATE_DATE int,
primary key(STATUS_CODE_PK)
);



insert into STATUS_CODE_TABLE(INDEX_TB, COLUMN_NAME, CODE, DESCRIPTION, CREATE_DATE) VALUES(
'APPROVAL_FRAME_TABLE', 'CURRENT_STEP', 0, '전자결제 대기 상태', 1638681629
);

insert into STATUS_CODE_TABLE(INDEX_TB, COLUMN_NAME, CODE, DESCRIPTION, CREATE_DATE) VALUES(
'APPROVAL_FRAME_TABLE', 'CURRENT_STEP', 1, '전자결제 진행 상태', 1638681629
);
insert into STATUS_CODE_TABLE(INDEX_TB, COLUMN_NAME, CODE, DESCRIPTION, CREATE_DATE) VALUES(
'APPROVAL_FRAME_TABLE', 'CURRENT_STEP', 2, '전자결제 완료 상태', 1638681629
);

insert into STATUS_CODE_TABLE(INDEX_TB, COLUMN_NAME, CODE, DESCRIPTION, CREATE_DATE) VALUES(
'APPROVAL_STEP_TABLE', 'DECISION', 0, '대기', 1638681629
);
insert into STATUS_CODE_TABLE(INDEX_TB, COLUMN_NAME, CODE, DESCRIPTION, CREATE_DATE) VALUES(
'APPROVAL_STEP_TABLE', 'DECISION', 1, '승인', 1638681629
);
insert into STATUS_CODE_TABLE(INDEX_TB, COLUMN_NAME, CODE, DESCRIPTION, CREATE_DATE) VALUES(
'APPROVAL_STEP_TABLE', 'DECISION', 2, '반려', 1638681629
);