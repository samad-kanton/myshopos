<?php
    
    require('../model/conn.php');

    try{
        if(isset($_GET['accounts'])){
            if(isset($_GET['pop'])){
                $q = $con->prepare("SELECT * FROM finance_accounts;");
                $q->execute();
                $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif(isset($_GET['new'])){
                // $json['data'] = $_REQUEST;            
                $q = $con->prepare("INSERT INTO finance_accounts(acc_type, acc_name, acc_num, acc_addr, memo, emp_id) VALUES(?, ?, ?, ?, ?, ?)");
                $json['saved'] = $q->execute([$_POST['acc_type'], $_POST['acc_name'], $_POST['acc_num'], $_POST['acc_addr'] ?? '', $_POST['memo'], $_GET['emp_id']]) ? true : $con->errorInfo();        
            }
            elseif(isset($_GET['update'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("UPDATE finance_accounts SET $_POST[col]='$_POST[newValue]' WHERE acc_id=$_POST[acc_id];");
                $json['updated'] = $q->execute() ? true : $con->errorInfo();
            }
            elseif(isset($_GET['delete'])){
                $q = $con->prepare("UPDATE finance_accounts SET active=false WHERE acc_id=:acc_id;");
                $json['deleted'] = $q->execute([':acc_id' => $_POST['key']]) ? true : $con->errorInfo();
            }
        }
        else{
            if(isset($_GET['pop'])){
                $q = $con->prepare("SELECT f.*, fa.acc_name, fa.acc_type FROM finances f LEFT JOIN finance_accounts fa ON f.acc_id=fa.acc_id WHERE f.active != 0;");
                $q->execute();
                $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif(isset($_GET['new'])){
                // $json['data'] = $_REQUEST;            
                $q = $con->prepare("INSERT INTO finances(dated, activity, ref, acc_id, amt, memo, emp_id) VALUES(?, ?, ?, ?, ?, ?, ?)");
                $json['saved'] = $q->execute([$_POST['transDate'], $_POST['activity'], $_POST['ref'], $_POST['acc_name'], $_POST['amt'], $_POST['memo'], $_GET['emp_id']]) ? true : $con->errorInfo();        
            }
            elseif(isset($_GET['update'])){
                $q = $con->prepare("UPDATE finances SET dated=?, activity=?, ref=?, acc_id=?, amt=?, memo=?, emp_id=? WHERE finance_id=?");
                $json['updated'] = $q->execute([$_POST['transDate'], $_POST['activity'], $_POST['ref'], $_POST['acc_name'], $_POST['amt'], $_POST['memo'], $_GET['emp_id'], $_GET['finance_id']]) ? true : $con->errorInfo();
            }
            elseif(isset($_GET['delete'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("UPDATE finances SET active=false WHERE finance_id=:finance_id;");
                $json['deleted'] = $q->execute([':finance_id' => $_POST['key']]) ? true : $con->errorInfo();
            }
        }
    } catch (PDOException $e) {
        $json['data'] = "Error: " . $e->getMessage();
    }

    echo json_encode($json);

?>
