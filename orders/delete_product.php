<?php

    require('../../model/conn.php');
    if(protect('key', FILTER_VALIDATE_INT)){
        $can = '';
        try {
            $q = $con->prepare("SELECT * FROM product WHERE prod_id = :prod_id;");
            $q->execute([':prod_id' => $_POST['prod_id']]);
            $row = $q->fetch();
            if(($row['qty']-$_POST['qty']) >= 0){
                $q1 = $con->prepare("UPDATE product SET qty=qty-:qty WHERE prod_id='$_POST[prod_id]';");
                $q1->bindParam(':qty', $_POST['qty']);
                $q1->execute();
            }
            $q2 = $con->prepare("DELETE FROM orders WHERE order_id = :order_id;");
            echo $q2->execute([':order_id' => protect('key', FILTER_VALIDATE_INT)]) ? true : $con->error();
        } catch (PDOException $e) {
            throw "Error!. Could not delete" . $e->getMessage();
        }
    }

?>
