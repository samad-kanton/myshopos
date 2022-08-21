<?php

    require('../../model/conn.php');

    $data = "";

    $q = $con->prepare("SELECT * FROM supplier ORDER BY sup_name ASC;");
    $q->execute();
    $q->setFetchmode(PDO::FETCH_ASSOC);
    if($q->rowCount() > 0){
        while($row = $q->fetch()){
            $data .= "<option value='$row[sup_id]'>$row[sup_name]</option>";
        }
    }
    else{
        $data .= "<option value=''>No Supplier info exist!</option>";
    }

    echo $data;

?>