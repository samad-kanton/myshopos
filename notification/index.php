<?php
    // header(('Content-Type: application/json'));
    require('../model/conn.php');

    $json = array('data' => '');

    $q = $con->prepare("SELECT UPPER(item) AS item, qty_wh, qty_sf, restock FROM stock WHERE restock>=qty_wh OR restock>=qty_sf ORDER BY item ASC;");
    $q->execute(); 
    if($q->rowCount() > 0){
        $json['found'] = true;
        $json['caption'] = "<span>". $q->rowCount() . " items are due for restock.</span>";               
        $json['data'] .= "<div class='bg-default' style='border-bottom: solid 1px #eee; display: flex; justify-content: space-between; align-items: center; font-family: Trebuchet MS;'><div class='cl-8 cm-8 cs-8 cx-8 bg-danger' style='padding: 10px;'>Description</div><div class='cl-1 cm-1 cs-1 cx-1 bg-danger txt-center' style='padding: 10px;'>WH</div><div class='cl-1 cm-1 cs-1 cx-1 bg-danger txt-center' style='padding: 10px;'>SF</div></div>";
        $json['data'] .= "<ul style='margin: 0; padding: 0; height: 85vh; overflow-y: auto;'>"; 
        while($row = $q->fetch()){
            // $json['data'] .= "<li style='border-bottom: solid 1px #eee; display: flex; justify-content: space-between; align-items: center; font-family: Trebuchet MS;'><span style='padding: 10px;'>$row[item]</span><span style='padding: 10px;'> $row[qty_wh] | $row[qty_sf]</span></li>";
            $qty_wh = $row['qty_wh'] < $row['restock'] ? $row['qty_wh'] : "";
            $qty_sf = $row['qty_sf'] < $row['restock'] ? $row['qty_sf'] : "";
            $json['data'] .= "<li class='bg-default' style='border-bottom: solid 1px #eee; display: flex; justify-content: space-between; align-items: center; font-family: Trebuchet MS;'><div class='cl-8 cm-8 cs-8 cx-8' style='padding: 10px 10px 10px 5px;'>$row[item]</div><div class='cl-1 cm-1 cs-1 cx-1 txt-right' style='padding: 10px;'>$qty_wh</div><div class='cl-1 cm-1 cs-1 cx-1 txt-right' style='padding: 10px;'>$qty_sf</div></li>";
        }
        $json['data'] .= "</ul>";
    }
    else{
        $json['found'] = false;
        $json['caption'] = "<span>No item is due for restock at the moment.</span>"; 
        $json['data'] = "<h3 class='txt-center'>No record found!</h3>";
    }

    echo json_encode($json);

