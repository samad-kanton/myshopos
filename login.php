<?php

    require('./model/conn.php');

    if(isset($_GET['pincode'])){
        $q = $con->prepare("SELECT emp_id, fullname, pin, urole, rights, photos FROM employees WHERE pin = $_GET[pincode];");
        $q->execute();
        if($q->rowCount() > 0) {
            $row = $q->fetch(PDO::FETCH_ASSOC);
            $json = array('access' => true, 'userId' => $row['emp_id'], 'fullName' => "$row[fullname]", 'uRole' => "$row[urole]", 'rights' => $row["rights"], 'photos' => $row["photos"]);
        }
        else{
            $json = array('access' => false);
        }
        
        echo json_encode($json);
    }

?>
