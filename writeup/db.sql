CREATE TABLE "account" (
  "accountId" varchar(36) NOT NULL,
  "email" varchar(255) NOT NULL,
  "firstName" varchar(50) NOT NULL,
  "otherNames" varchar(255) NOT NULL,
  "lastName" varchar(50) NOT NULL,
  "password" varchar(60) NOT NULL,
  PRIMARY KEY ("accountId"),
  UNIQUE KEY "Unq_account_email" ("email")
);
CREATE TABLE "accountClassLink" (
  "accountId" varchar(36) NOT NULL,
  "classId" varchar(36) NOT NULL,
  PRIMARY KEY ("accountId","classId"),
  KEY "accountClassLink_fk1" ("classId"),
  CONSTRAINT "accountClassLink_fk0" FOREIGN KEY ("accountId") REFERENCES "account" ("accountId") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "accountClassLink_fk1" FOREIGN KEY ("classId") REFERENCES "class" ("classId") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE "class" (
  "classId" varchar(36) NOT NULL,
  "name" varchar(50) NOT NULL,
  "subjectId" int(11) NOT NULL,
  PRIMARY KEY ("classId"),
  KEY "class_fk0" ("subjectId"),
  CONSTRAINT "class_fk0" FOREIGN KEY ("subjectId") REFERENCES "subject" ("subjectId") ON UPDATE NO ACTION
);
CREATE TABLE "parent" (
  "parentId" varchar(36) NOT NULL,
  "email" varchar(255) NOT NULL,
  "firstName" varchar(50) NOT NULL,
  "otherNames" varchar(50) NOT NULL,
  "lastName" varchar(50) NOT NULL,
  "password" varchar(60) NOT NULL,
  PRIMARY KEY ("parentId"),
  UNIQUE KEY "Unq_parent" ("email")
);
CREATE TABLE "passwordReset" (
  "accountId" varchar(36) NOT NULL,
  "token" varchar(60) NOT NULL,
  "nonce" varchar(16) NOT NULL,
  "expires" datetime NOT NULL,
  PRIMARY KEY ("accountId"),
  CONSTRAINT "fk_passwordreset_account" FOREIGN KEY ("accountId") REFERENCES "account" ("accountId") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "fk_passwordreset_parent" FOREIGN KEY ("accountId") REFERENCES "parent" ("parentId") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "fk_passwordreset_student" FOREIGN KEY ("accountId") REFERENCES "student" ("studentId") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE "student" (
  "studentId" varchar(36) NOT NULL,
  "email" varchar(255) NOT NULL,
  "firstName" varchar(50) NOT NULL,
  "otherNames" varchar(50) NOT NULL,
  "lastName" varchar(50) NOT NULL,
  "password" varchar(60) NOT NULL,
  PRIMARY KEY ("studentId"),
  UNIQUE KEY "Unq_student" ("email")
);
CREATE TABLE "studentClassLink" (
  "studentId" varchar(36) NOT NULL,
  "classId" varchar(36) NOT NULL,
  PRIMARY KEY ("studentId","classId"),
  CONSTRAINT "fk_studentclasslink_student" FOREIGN KEY ("studentId") REFERENCES "student" ("studentId") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE "studentParentLink" (
  "studentid" varchar(36) NOT NULL,
  "parentId" varchar(36) NOT NULL,
  PRIMARY KEY ("studentid","parentId"),
  KEY "studentParentLink_fk1" ("parentId"),
  CONSTRAINT "studentParentLink_fk0" FOREIGN KEY ("studentid") REFERENCES "student" ("studentId") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "studentParentLink_fk1" FOREIGN KEY ("parentId") REFERENCES "parent" ("parentId") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE "subject" (
  "subjectId" int(11) NOT NULL AUTO_INCREMENT,
  "name" varchar(100) NOT NULL,
  PRIMARY KEY ("subjectId")
);
CREATE TABLE "test" (
  "testId" varchar(36) NOT NULL,
  "testTemplateId" varchar(36) NOT NULL,
  "classId" varchar(36) NOT NULL,
  "testDate" date NOT NULL,
  PRIMARY KEY ("testId"),
  UNIQUE KEY "Unq_test" ("testTemplateId","classId","testDate"),
  KEY "fk_test_account" ("classId"),
  CONSTRAINT "fk_test_account" FOREIGN KEY ("classId") REFERENCES "class" ("classId") ON UPDATE NO ACTION,
  CONSTRAINT "fk_test_testtemplate" FOREIGN KEY ("testTemplateId") REFERENCES "testTemplate" ("testTemplateId") ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE TABLE "testResult" (
  "studentId" varchar(36) NOT NULL,
  "testId" varchar(36) NOT NULL,
  "accountId" varchar(36) NOT NULL,
  "mark" int(11) NOT NULL,
  PRIMARY KEY ("studentId","testId"),
  KEY "fk_testresult_test" ("testId"),
  KEY "fk_testresult_account" ("accountId"),
  CONSTRAINT "fk_testresult_account" FOREIGN KEY ("accountId") REFERENCES "account" ("accountId") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "fk_testresult_test" FOREIGN KEY ("testId") REFERENCES "test" ("testId") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "testResult_fk0" FOREIGN KEY ("studentId") REFERENCES "student" ("studentId") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE "testTemplate" (
  "testTemplateId" varchar(36) NOT NULL,
  "accountId" varchar(36) NOT NULL,
  "name" varchar(100) NOT NULL,
  "maxMark" int(11) NOT NULL,
  PRIMARY KEY ("testTemplateId"),
  KEY "test_fk0" ("accountId"),
  CONSTRAINT "test_fk0" FOREIGN KEY ("accountId") REFERENCES "account" ("accountId") ON DELETE NO ACTION ON UPDATE NO ACTION
);
