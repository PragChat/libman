create database test;
use test;
create table BOOKS(
    ISBN bigint primary key,
    NAME varchar(60),
    IF_TAKEN tinyint default 0,
    TAKEN_NAME varchar(60));
create table REQUESTS(
    ID int primary key auto_increment,
    REQUEST_TYPE tinyint,
    ISBN bigint,
    BOOK varchar(60),
    CLIENT_ID int,
    CLIENT varchar(60),
    foreign key (ISBN) references BOOKS(ISBN));
create table ADMINS(
    AID int primary key auto_increment,
    ANAME varchar(60),
    PWD varchar(70));
create table CLIENTS(
    UID int primary key auto_increment,
    UNAME varchar(60),
    PWD varchar(70));
insert into ADMINS(ANAME, PWD) values ("pikachu", "HC8Z8IkUOKMC7MWXbsTgGWab/bznMtA9Usb2w2omZmI=");
insert into BOOKS(ISBN, NAME) values (743273567, "The Great Gatsby");
insert into BOOKS(ISBN, NAME) values (1860920101, "The Higgler");
insert into BOOKS(ISBN, NAME) values (1860920128, "Murder!");
insert into BOOKS(ISBN, NAME) values (1860920497, "The Grass is Always Greener");