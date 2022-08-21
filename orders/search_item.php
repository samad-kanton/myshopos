<?php
    require('../../model/conn.php');

    $json = array('items' => '');

    try{
        $search_term = !empty(protect('search_term', FILTER_SANITIZE_STRING)) ? protect('search_term', FILTER_SANITIZE_STRING) : "";

        if($search_term){
            $q = $con->prepare("SELECT item FROM stock WHERE item LIKE :item_name ORDER BY item ASC;");
            $q->execute([':item_name' => '%'. $search_term . '%']);
            if($q->rowCount() > 0){
                while ($row = $q->fetch(PDO::FETCH_ASSOC)) {
                    $json['items'] .= "<option value='" . strtoupper($row['item']) . "'>" . strtoupper($row['item']) . "</option>";
                }        
            }
            else{
                $json['items'] = "<option value='Not Found!'>Not Found!</option>";            
            }

            $q = $con->prepare("SELECT barcode, cp, wp, rp, restock, expdate FROM stock WHERE item = :item_name ORDER BY item ASC;");
            $q->execute([':item_name' => $search_term]);
            if($q->rowCount() > 0){
                $json['found'] = true;
                while ($row = $q->fetch(PDO::FETCH_ASSOC)) {
                    $json['barcode'] = $row['barcode'];
                    $json['cp'] = number_format($row['cp'], 2);
                    $json['wp'] = number_format($row['wp'], 2);
                    $json['rp'] = number_format($row['rp'], 2);
                    $json['restock'] = $row['restock'];
                    $json['expdate'] = $row['expdate'];
                }        
            }
        }
    }catch (PDOException $e) {
        $json['data'] = "Error executing query" . $e->getMessage();
    }
    echo json_encode($json);
?>