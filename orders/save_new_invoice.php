<?php

require('../../model/conn.php');

$json = array('saved' => false, 'item_exist_index' => '', 'items_exist_ids' => '', 'err' => '');

$sup_id = $_GET['sup_id'];
$invoice = protect('invoice', FILTER_SANITIZE_STRING);

// $items = strtoupper(protect('item[]', FILTER_SANITIZE_STRING));

// $brand = strtoupper(protect('brand', FILTER_SANITIZE_STRING));
// $qtys = protect('qty[]', FILTER_SANITIZE_NUMBER_INT);
// $cps = protect('cp[]', FILTER_VALIDATE_FLOAT);
// $sp = protect('sp[]', FILTER_VALIDATE_FLOAT);
// $restock = protect('restock[]', FILTER_SANITIZE_NUMBER_INT);

// $json['data'] = $_POST['item'];
$wp = 0;
for ($i = 0; $i < count($_POST['item']); $i++) {
    try {
        // $q = $con->prepare("SELECT prod_id, item, barcode FROM stock WHERE item = :item_name;");
        // $q->execute([':item_name' => strtoupper($_POST['item'][$i])]);
        // if ($q->rowCount() > 0) {
        //     $row = $q->fetch();
        //     $json['barcode'] = $_POST['barcode'][$i];
        //     if (!empty($_POST['barcode'][$i]) && $_POST['barcode'][$i] != $row['barcode']) {
        //         $q1 = $con->prepare("UPDATE stock SET lastmod=:lastmod, item=:item, barcode=:barcode, qty_wh=qty_wh+:qty_wh, cp=:cp, wp=:wp, rp=:rp, restock=:restock WHERE prod_id='$row[prod_id]';");
        //         $q1->execute([':lastmod' => $curDate, ':item' => $_POST['item'][$i], ':barcode' => $_POST['barcode'][$i], ':qty_wh' => $_POST['qty'][$i], ':cp' => $_POST['cp'][$i], ':wp' => $wp, ':rp' => $_POST['rp'][$i], ':restock' => $_POST['restock'][$i]]);
        //     } else {
        //         $q1 = $con->prepare("UPDATE stock SET lastmod=:lastmod, item=:item, qty_wh=qty_wh+:qty_wh, cp=:cp, wp=:wp, rp=:rp, restock=:restock WHERE prod_id='$row[prod_id]';");
        //         $q1->execute([':lastmod' => $curDate, ':item' => $_POST['item'][$i], ':qty_wh' => $_POST['qty'][$i], ':cp' => $_POST['cp'][$i], ':wp' => $wp, ':rp' => $_POST['rp'][$i], ':restock' => $_POST['restock'][$i]]);
        //     }
        //     $json['prod_id'] = $row['prod_id'];
        //     $q2 = $con->prepare("INSERT INTO orders(regdate, lastmod, sup_id, invoice, prod_id, barcode, qty_wh, cp, wp, rp, restock, expdate, emp_id) VALUES(:regdate, :lastmod, :sup_id, :invoice, :prod_id, :barcode, :qty_wh, :cp, :wp, :rp, :restock, :expdate, :emp_id)");
        //     $q2->bindParam(':regdate', $curDate);
        //     $q2->bindParam(':lastmod', $curDate);
        //     $q2->bindParam(':sup_id', $sup_id);
        //     $q2->bindParam(':invoice', $invoice);
        //     $q2->bindParam(':prod_id', $json['prod_id']);
        //     $q2->bindParam(':barcode', $_POST['barcode'][$i]);
        //     $q2->bindParam(':qty_wh', $_POST['qty'][$i]);
        //     $q2->bindParam(':cp', $_POST['cp'][$i]);
        //     $q2->bindParam(':wp', $wp);
        //     $q2->bindParam(':rp', $_POST['rp'][$i]);
        //     $q2->bindParam(':restock', $_POST['restock'][$i]);
        //     $q2->bindParam(':expdate', $_POST['expdate'][$i]);
        //     $q2->bindParam(':emp_id', $_GET['emp_id']);
        //     $json['saved'] = $q2->execute() ? true : false;
        // } 
        // else {
        //     $json['item_exist'] = false;

            $q1 = $con->prepare("INSERT INTO stock(regdate, lastmod, item, barcode, dim, rp, emp_id) VALUES(:regdate, :lastmod, :item, :barcode, :dim, :rp, :emp_id)");
            $q1->bindParam(':regdate', $curDate);
            $q1->bindParam(':lastmod', $curDate);
            $q1->bindParam(':item', $_POST['item'][$i]);
            $q1->bindParam(':barcode', $_POST['barcode'][$i]);
            $q1->bindParam(':dim', $_POST['dim'][$i]);
            $q1->bindParam(':rp', $_POST['rp'][$i]);
            $q1->bindParam(':emp_id', $_GET['emp_id']);
            $json['saved'] = $q1->execute() ? true : false;
            $json['prod_id'] = $con->lastInsertId();

            // $q2 = $con->prepare("INSERT INTO orders(regdate, lastmod, prod_id, barcode, dim, rp, emp_id) VALUES(:regdate, :lastmod, :prod_id, :barcode, :dim, :rp, :emp_id)");
            // $q2->bindParam(':regdate', $curDate);
            // $q2->bindParam(':lastmod', $curDate);
            // // $q2->bindParam(':sup_id', $sup_id);
            // // $q2->bindParam(':invoice', $invoice);
            // $q2->bindParam(':prod_id', $json['prod_id']);
            // $q2->bindParam(':barcode', $_POST['barcode'][$i]);
            // $q2->bindParam(':dim', $_POST['dim'][$i]);
            // // $q2->bindParam(':cp', $_POST['cp'][$i]);
            // // $q2->bindParam(':wp', $wp);
            // $q2->bindParam(':rp', $_POST['rp'][$i]);
            // // $q2->bindParam(':restock', $_POST['restock'][$i]);
            // // $q2->bindParam(':expdate', $_POST['expdate'][$i]);
            // $q2->bindParam(':emp_id', $_GET['emp_id']);
            // $json['saved'] = $q2->execute() ? true : false;
        // }
    } catch (PDOException $e) {
        $json['err'] = "Error executing query" . $e->getMessage();
    }
}

echo json_encode($json);
