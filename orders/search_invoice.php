<?php

    require('../../model/conn.php');

    $json = array('invoices' => '');

    try{
        $search_term = !empty(protect('search_term', FILTER_SANITIZE_STRING)) ? protect('search_term', FILTER_SANITIZE_STRING) : "";
        if($search_term){
            $q = $con->prepare("SELECT DISTINCT(invoice) FROM orders WHERE invoice LIKE :invoice;");
            $q->execute([':invoice' => "%$search_term%"]);
            if($q->rowCount() > 0){
                while ($row = $q->fetch(PDO::FETCH_ASSOC)) {
                    $json['invoices'] .= "<option value'$row[invoice]'>$row[invoice]</option>";
                }  
                
                $q = $con->prepare("SELECT DISTINCT(sup_id) FROM orders WHERE invoice = :invoice;");
                $q->execute([':invoice' => $search_term]);
                if($q->rowCount() > 0){
                    $json['found'] = true;
                    $row = $q->fetch(PDO::FETCH_ASSOC);
                    $json['sup_id'] = $row['sup_id'];
                }
            }
            else{
                $json['invoices'] = "<option value='Not Found!'>Not Found!</option>";            
            }
        }
    }catch (PDOException $e) {
        $data = "Error executing query" . $e->getMessage();
    }

echo json_encode($json);
