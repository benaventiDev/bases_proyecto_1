#!/bin/bash

set -e
export INSTALL=/
echo `hostname -I|awk '{print $1}'` `hostname -s` `hostname` >> /etc/hosts

rm -rf /u01/app/oracle/product/18.0.0/dbhome_1/network/admin/listener.ora

echo "Setting ENV"
echo oracle:oracle | chpasswd
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=/u01/app/oracle/product/18.0.0/dbhome_1
export ORACLE_SID=ORCL18 >> /home/oracle/.bashrc
export ORACLE_BASE=/u01/app/oracle >> /home/oracle/.bashrc
export ORACLE_HOME=/u01/app/oracle/product/18.0.0/dbhome_1 >> /home/oracle/.bashrc
export PATH=$ORACLE_HOME/bin:$PATH >> /home/oracle/.bashrc
oracle

echo "Starting default listener"
gosu oracle  bash -c "$ORACLE_HOME/bin/netca -silent -responseFile $ORACLE_HOME/netca.rsp"


echo "Configuring the TNS"
sh $INSTALL/tns.sh
chown oracle:oinstall $ORACLE_HOME/network/admin/tnsnames.ora


gosu oracle bash<<EOF 
export ORACLE_SID=ORCL18
sqlplus / as sysdba
startup;
alter system register;
alter session set "_ORACLE_SCRIPT"=true;
CREATE USER benaventi IDENTIFIED BY benaventi;
GRANT ALL PRIVILEGES TO benaventi;
EOF

gosu oracle  bash
