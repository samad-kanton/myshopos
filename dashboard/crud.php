<?php
    
    require('../model/conn.php');

    try {    
        $json = array();     
        if(isset($_GET['totalPurchases'])){
            $CLAUSE = "WHERE o.prod_id=st.prod_id AND DATE_FORMAT(o.regdate, '%Y')=$_GET[year]";
            $q = $con->prepare("SELECT DATE_FORMAT(o.regdate, '%m') AS mm, o.cp, o.new_qty, st.item, st.ppq FROM orders o LEFT JOIN stock st ON o.prod_id=st.prod_id $CLAUSE;");
            $q->execute(); 
            // $json['rowCount'] = $q->rowCount();
            if($q->rowCount() > 0){
                while($row = $q->fetch(PDO::FETCH_ASSOC)){
                    $ppq = json_decode($row['ppq'], true);
                    $json['data'][] = [
                        // 'item' => $row['item'],
                        'mm' => $row['mm'],
                        'amt' => count($ppq) > 1 ? ($row['cp'] / max(array_map(function($v){
                            return ((object) $v)->qty;
                        }, $ppq)))*$row['new_qty'] : ($row['cp']*$row['new_qty']),
                    ];
                } 
                $json['arr'] = [];
                foreach (array_unique(array_column($json['data'], 'mm')) as $key => $value) {
                    $json['arr'][] = ['mm' => $value, 'amt' => array_reduce($json['data'], function($carry, $item) use($value) {
                        return $item['mm'] == $value ? $carry += $item['amt'] : $carry;
                    }, 0)];
                }
            } 
            $json['data'] = ['totalPurchases' => $json['arr']];
        }
        
        if(isset($_GET['totalStocks'])){
            $CLAUSE = "WHERE DATE_FORMAT(regdate, '%Y')=$_GET[year]";
            $q = $con->prepare("SELECT DATE_FORMAT(regdate, '%m') AS mm, item, cp, qty, ppq FROM stock $CLAUSE;");
            $q->execute(); 
            if($q->rowCount() > 0){
                while($row = $q->fetch(PDO::FETCH_ASSOC)){
                    $ppq = json_decode($row['ppq'], true);
                    $json['data'][] = [
                        'item' => $row['item'],
                        'mm' => $row['mm'],
                        'amt' => count($ppq) > 1 ? ($row['cp'] / max(array_map(function($v){
                            return ((object) $v)->qty;
                        }, $ppq)))*$row['qty'] : ($row['cp']*$row['qty']),
                    ];
                } 
                $json['arr'] = [];
                foreach (array_unique(array_column($json['data'], 'mm')) as $key => $value) {
                    $json['arr'][] = ['mm' => $value, 'amt' => array_reduce($json['data'], function($carry, $item) use($value) {
                        return $item['mm'] == $value ? $carry += $item['amt'] : $carry;
                    }, 0)];
                }
            }  
            $json['data'] = ['totalStocks' => $json['arr']];
        }

        if(isset($_GET['totalSales'])){
            $CLAUSE = "WHERE DATE_FORMAT(strans.regdate, '%Y')=$_GET[year] AND s.returned != 1";
            $q = $con->prepare("SELECT DATE_FORMAT(strans.regdate, '%m') AS mm, SUM(s.qty*s.sp) AS amt FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id $CLAUSE GROUP BY DATE_FORMAT(strans.regdate, '%m');");
            $q->execute();  
            $json['data'] = ['totalSales' => $q->fetchAll(PDO::FETCH_ASSOC)];
        }

        if(isset($_GET['totalExpenses'])){
            $CLAUSE = "WHERE DATE_FORMAT(regdate, '%Y')=$_GET[year] AND activity = 'Payment'";
            $q = $con->prepare("SELECT DATE_FORMAT(regdate, '%m') AS mm, SUM(amt) AS amt FROM finances $CLAUSE GROUP BY DATE_FORMAT(regdate, '%m');");
            $q->execute();  
            $json['data'] = ['totalExpenses' => $q->fetchAll(PDO::FETCH_ASSOC)];
        }
        
        if(isset($_GET['totalProfits'])){
            $CLAUSE = "WHERE DATE_FORMAT(strans.regdate, '%Y')=$_GET[year] AND s.returned != 1";
            $q = $con->prepare("SELECT DATE_FORMAT(strans.regdate, '%m') AS mm, SUM((s.qty*s.sp)-(s.qty*s.cp)) AS amt FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id $CLAUSE GROUP BY DATE_FORMAT(strans.regdate, '%m');");
            $q->execute();  
            $json['data'] = ['totalProfits' => $q->fetchAll(PDO::FETCH_ASSOC)];
        }         

        if(isset($_GET['topSellingItems'])){
            // $json['data'] = $_REQUEST;
            $CLAUSE = "WHERE DATE_FORMAT(strans.regdate, '%Y')=$_GET[year] AND s.returned!=1";
            $q = $con->prepare("SELECT DATE_FORMAT(strans.regdate, '%m') AS mm, s.prod_id, strans.strans_id, SUM(s.qty) AS UNITS_SOLD, st.item FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id LEFT JOIN stock st ON s.prod_id=st.prod_id $CLAUSE GROUP BY s.prod_id ORDER BY UNITS_SOLD DESC LIMIT 10;");
            $q->execute();  
            $json['data'] = ['topSellingItems' => $q->fetchAll(PDO::FETCH_ASSOC)];
        }

        if(isset($_GET['weeklyDaySales'])){
            $CLAUSE = "WHERE DATE_FORMAT(strans.regdate, '%Y')=$_GET[year] AND s.returned!=1";
            $q = $con->prepare("SELECT DATE_FORMAT(strans.regdate, '%w') AS wd, SUM(s.qty*s.sp) AS amt FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id $CLAUSE GROUP BY DATE_FORMAT(strans.regdate, '%w');");
            $q->execute();  
            $json['data'] = ['weeklyDaySales' => $q->fetchAll(PDO::FETCH_ASSOC)];
        }

        if(isset($_GET['paymentMethodsSales'])){
            $CLAUSE = "WHERE DATE_FORMAT(strans.regdate, '%Y')=$_GET[year] AND strans.strans_id=s.strans_id AND s.returned!=1 AND strans.pm_id=PAY_TYPE";
            $q = $con->prepare("SELECT pm_id AS PAY_TYPE, title, (SELECT IFNULL(SUM(s.qty*s.sp), 0) FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id $CLAUSE) AS amt FROM payment_methods ORDER BY pm_id;");
            $q->execute();  
            $json['data'] = ['paymentMethodsSales' => $q->fetchAll(PDO::FETCH_ASSOC)];
        } 

        if(isset($_GET['topCustomers'])){
            // $json['data'] = $_REQUEST;
            $CLAUSE = "WHERE DATE_FORMAT(strans.regdate, '%Y')=$_GET[year] AND s.returned!=1";
            $q = $con->prepare("SELECT SUM(qty*sp) FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id $CLAUSE GROUP BY strans.cust_id DESC LIMIT 10;");
            $q->execute();  
            $json['data'] = ['topCustomers' => $q->fetchAll(PDO::FETCH_ASSOC)];
        }
        
    } catch (PDOException $e) {
        $json['data'] = "Error: " . $e->getMessage();
    }

    echo json_encode($json);

?>
