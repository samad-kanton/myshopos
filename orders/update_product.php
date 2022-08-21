<?php

    require('../../model/conn.php');

    $json = array('updated' => false, 'err' => ''); 

    $product_id = strtoupper(protect('edit_product_id', FILTER_VALIDATE_INT));
    $item = strtoupper(protect('edit_item', FILTER_SANITIZE_STRING));
    // $sup_id = protect('sup_id', FILTER_SANITIZE_STRING);
    // $brand = strtoupper(protect('brand', FILTER_SANITIZE_STRING));
    $qty = strtoupper(protect('edit_qty', FILTER_SANITIZE_NUMBER_INT));
    $cp = protect('edit_cp', FILTER_VALIDATE_FLOAT);
    $sp = strtoupper(protect('edit_sp', FILTER_VALIDATE_FLOAT));
    $reproduct = protect('edit_reproduct', FILTER_SANITIZE_NUMBER_INT);

    try{
        $q = $con->prepare("SELECT * FROM product WHERE item=:product_name;");
        $q->bindParam(':product_name', $item);
        $q->execute();
        if($q->rowCount() > 0){
            $q->setFetchMode(PDO::FETCH_ASSOC);
            $row = $q->fetch();
            if($row['product_id'] == $product_id){
                $q = $con->prepare("UPDATE product SET lastmod=:lastmod, item=:product_name, qty=:product_qty, cp=:product_cp, sp=:product_sp WHERE product_id=:product_id;");
                $q1->bindParam(':curDate', $curDate);
                $q1->bindParam(':lastmod', $curDate);
                $q1->bindParam(':item', $item);
                $q1->bindParam(':qty', $qty);
                $q1->bindParam(':cp', $cp);
                $q1->bindParam(':sp', $sp);
                $q1->bindParam(':restock', $restock);
                $q->execute() ? $json['updated'] = true : $con->error();
            } 
            else{ 
                $json['product_exist'] = true;
            }
        }
        else{
            $q = $con->prepare("UPDATE product SET lastmod=:lastmod, item=:product_name, qty=:product_qty, cp=:product_cp, sp=:product_sp WHERE product_id=:product_id;");
            $q->bindParam(':product_id', $product_id);
            $q->bindParam(':lastmod', $curDate);
            $q->bindParam(':product_name', $item);
            $q->bindParam(':product_qty', $qty);
            $q->bindParam(':product_cp', $cp);
            $q->bindParam(':product_sp', $sp);
            $q->execute() ? $json['updated'] = true : $con->error();
        }
    }
    catch (PDOException $e) {
        $json['error'] = "Error executing query" . $e->getMessage();
    }
    
    echo json_encode($json);

?>
