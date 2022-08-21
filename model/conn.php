<?php

    date_default_timezone_set("UTC");

    $curDate = date(('Y-m-d H:i:s'), strtotime('now'));

    class Db{
        
        private $dbhost = "localhost";
        private $dbuser = "root";
        private $dbpswd = "0503941618";
        private $dbname = "myshopos_pinam";
        protected $con;            

        function connect(){
            if(!isset($this->con)){ // ASSERT TO ENSURE ONLY A SINGLE CONNECTION
                $this->con = new PDO("mysql:host=" . $this->dbhost."; dbname=" . $this->dbname, $this->dbuser, $this->dbpswd);
                $this->con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }
            return $this->con;
        }

        function hello(){
            return "Hello method";
        }
        
    }

    try {       

        $db = new Db();
        $con = $db->connect();

    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }

?>