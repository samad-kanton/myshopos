
<?php
    
    require('../model/conn.php');  

    // $df = $_GET['df'] ?? [];
    // $dt = $_GET['dt'] ?? [];
    // $json['groupBy'] = $_GET['groupBy'] ?: null;
    // $json['TRANS_DATE_FORMAT'] = $json['groupBy'] == 'daily' ? "%a %M %d, %Y" : ($json['groupBy'] == 'weekly' ? "%U" : ($json['groupBy'] == 'monthly' ? "%M %Y" : "%Y"));
    // $json['GROUPBY'] = $json['groupBy'] == 'daily' ? "TRANS_DATE" : ($json['groupBy'] == 'weekly' ? "WEEK(strans.regdate)" : ($json['groupBy'] == 'monthly' ? "EXTRACT(YEAR_MONTH FROM strans.regdate)" : "EXTRACT(YEAR FROM strans.regdate)"));
    // $json['REQ'] = $_REQUEST;
    // echo json_encode($json);
    // exit();

    /**
     * 
     */
    trait Sales {

        use Db;

        function summary(){
            // return "Summary method from Sales Trait";
            $VAT_TILL = "(SELECT SUM(IF(JSON_EXTRACT(vat_discount, '$.vat.applied')=true, JSON_EXTRACT(vat_discount, '$.vat.amount'), 0)) FROM sales_trans WHERE emp_id=e.emp_id AND DATE_FORMAT(regdate, '$this->TRANS_DATE_FORMAT') = TRANS_DATE)";
            $DISCOUNT_TILL = "(SELECT SUM(IF(JSON_EXTRACT(vat_discount, '$.discount.applied')=true, JSON_EXTRACT(vat_discount, '$.discount.amount'), 0)) FROM sales_trans WHERE emp_id=e.emp_id AND DATE_FORMAT(regdate, '$this->TRANS_DATE_FORMAT') = TRANS_DATE)";
            $CASH_TILL = "(SELECT IFNULL(SUM(qty*sp), 0) FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id WHERE date_format(strans.regdate, '$this->TRANS_DATE_FORMAT')=TRANS_DATE AND s.returned!=1 AND strans.pm_id=1 AND strans.emp_id=e.emp_id)";
            $MOMO_TILL = "(SELECT IFNULL(SUM(qty*sp), 0) FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id WHERE date_format(strans.regdate, '$this->TRANS_DATE_FORMAT')=TRANS_DATE AND s.returned!=1 AND strans.pm_id=2 AND strans.emp_id=e.emp_id)";
            $POS_TILL = "(SELECT IFNULL(SUM(qty*sp), 0) FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id WHERE date_format(strans.regdate, '$this->TRANS_DATE_FORMAT')=TRANS_DATE AND s.returned!=1 AND strans.pm_id=3 AND strans.emp_id=e.emp_id)";
            $CREDIT_TILL = "(SELECT IFNULL(SUM(qty*sp), 0) FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id WHERE date_format(strans.regdate, '$this->TRANS_DATE_FORMAT')=TRANS_DATE AND s.returned!=1 AND strans.pm_id=4 AND strans.emp_id=e.emp_id)";
            $CLAUSE = "WHERE DATE_FORMAT(strans.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE) AND s.returned != 1";
            
            $q = $this->connect()->prepare("SELECT DATE_FORMAT(strans.regdate, '$this->TRANS_DATE_FORMAT') AS TRANS_DATE, strans.*, s.cp, s.sp, s.qty, SUM(s.qty*s.sp) AS EXT_AMT, $CASH_TILL AS CASH_TILL, $MOMO_TILL AS MOMO_TILL, $POS_TILL AS POS_TILL, $CREDIT_TILL AS CREDIT_TILL, ($CASH_TILL+$MOMO_TILL+$POS_TILL+$CREDIT_TILL) AS TOTAL_TILL, e.fullname FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id LEFT JOIN stock st ON s.prod_id=st.prod_id LEFT JOIN employees e ON strans.emp_id=e.emp_id $CLAUSE GROUP BY $this->GROUPBY, strans.emp_id;");
            $q->execute();  
            return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        }

        function callOver(){
            
        }
    }
    

    class Report extends Db{

        use Sales;

        function __construct(){
            $this->df = $_GET['df'] ?? [];
            $this->dt = $_GET['dt'] ?? [];
            $this->groupBy = $_GET['groupBy'] ?: null;
            $this->TRANS_DATE_FORMAT = $this->groupBy == 'daily' ? "%a %M %d, %Y" : ($json['groupBy'] == 'weekly' ? "%U" : ($this->groupBy == 'monthly' ? "%M %Y" : "%Y"));
            $this->GROUPBY = $json['groupBy'] == 'daily' ? "TRANS_DATE" : ($this->groupBy == 'weekly' ? "WEEK(strans.regdate)" : ($this->groupBy == 'monthly' ? "EXTRACT(YEAR_MONTH FROM strans.regdate)" : "EXTRACT(YEAR FROM strans.regdate)"));

        }

        function contacts($params){
            if($params['type'] == 0){
         
            }
            elseif($params['type'] == 1){
               
            }
            elseif($params['type'] == 2){
               
            }
            elseif($params['type'] == 3){
                
            }
        }

        function purchases($params){
            if($params['type'] == 0){
                $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(o.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1)";
                // $q = $this->connect()->prepare("SELECT o.regdate AS ORDER_DATE, o.order_id, o.prev_qty, o.new_qty, IF(st.wp_qty>1, (o.cp/st.wp_qty), o.cp) AS UNIT_COST, o.rp, o.emp_id, (o.new_qty*IF(st.wp_qty>1, (o.cp/st.wp_qty), o.cp)) AS COST_AMT, (o.new_qty*o.rp) AS SELLING_AMT, ((o.rp*o.new_qty)-(IF(st.wp_qty>1, (o.cp/st.wp_qty), o.cp)*o.new_qty)) AS PROFIT, st.prod_id, st.item, e.fullname FROM orders o LEFT JOIN stock st ON o.prod_id=st.prod_id LEFT JOIN employees e ON o.emp_id=e.emp_id $CLAUSE;");
                $q = $this->connect()->prepare("SELECT o.regdate AS ORDER_DATE, o.cp, o.order_id, o.prev_qty, o.new_qty AS qty, o.emp_id, st.prod_id, st.item, st.ppq, e.fullname FROM orders o LEFT JOIN stock st ON o.prod_id=st.prod_id LEFT JOIN employees e ON o.emp_id=e.emp_id $CLAUSE;");
                $q->execute();  
                return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif($params['type'] == 1){
               
            }
            elseif($params['type'] == 2){
               
            }
            elseif($params['type'] == 3){
                
            }
        }
        

        function stock($params){
            if($params['type'] == 0){
                $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(st.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND st.active=1";
                $q = $this->connect()->prepare("SELECT st.*, cat.* FROM stock st INNER JOIN categories cat On st.cat_id=cat.cat_id $CLAUSE;");
                $q->execute();
                return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif($params['type'] == 1){
                $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(st.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND st.qty <= st.restock;";
                $q = $this->connect()->prepare("SELECT st.*, cat.* FROM stock st INNER JOIN categories cat On st.cat_id=cat.cat_id $CLAUSE;");
                $q->execute();
                return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif($params['type'] == 2){
                $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(st.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND st.qty < 1";
                $q = $this->connect()->prepare("SELECT st.*, cat.* FROM stock st INNER JOIN categories cat On st.cat_id=cat.cat_id $CLAUSE;");
                $q->execute();
                return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif($params['type'] == 3){
                
            }
        }

        function sales($params){
            if($params['type'] == 0){
                // return [["fullname"=>"samad","fullname"=>"samad","CASH_TILL"=>"200","MOMO_TILL"=>"100","POS_TILL"=>"0","TOTAL_TILL"=>"300"]];
                return $this->summary();
            }
            elseif($params['type'] == 1){
                $CLAUSE = "WHERE DATE_FORMAT(strans.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE) AND s.returned != 1";
                $q = $this->connect()->prepare("SELECT DATE_FORMAT(strans.regdate, '%Y-%m-%d') AS TRANS_DATE, strans.*, s.*, st.item, (s.qty*s.sp) AS EXT_AMT, pm.title AS PAY_TYPE, c.cust_name, JSON_EXTRACT(c.addr, '$.contactAddr.cust_phone') AS cust_phone, c.is_default, e.fullname FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id LEFT JOIN payment_methods pm ON strans.pm_id=pm.pm_id LEFT JOIN stock st ON s.prod_id=st.prod_id LEFT JOIN customers c ON strans.cust_id=c.cust_id LEFT JOIN employees e ON strans.emp_id=e.emp_id $CLAUSE;");
                $q->execute();  
                return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif($params['type'] == 2){
                $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(strans.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND s.returned != 1";
                $q = $this->connect()->prepare("SELECT DATE_FORMAT(strans.regdate, '%Y-%m-%d') AS TRANS_DATE, s.cp, s.sp, (s.qty*s.dim) AS QTY_SOLD, (SUM(s.qty)*s.sp) AS EXT_AMT, st.item FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id LEFT JOIN stock st ON s.prod_id=st.prod_id $CLAUSE GROUP BY s.prod_id;");
                $q->execute(); 
                return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif($params['type'] == 3){
                $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(strans.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND s.returned != 1";
                $q = $this->connect()->prepare("SELECT DATE_FORMAT(strans.regdate, '%Y-%m-%d') AS TRANS_DATE, DATE_FORMAT(strans.lastmod, '%r') AS TRANS_TIME, strans.*, s.prod_id, s.cp, s.sp, s.qty, s.dim, SUM(s.qty) AS QTY, s.cp, SUM(s.cp*s.qty) AS COGS, s.sp, SUM(s.sp*s.qty) AS REVENUE, (SUM(s.sp*s.qty)-SUM(s.cp*s.qty)) AS PROFIT, st.item, e.fullname FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id LEFT JOIN stock st ON s.prod_id=st.prod_id LEFT JOIN employees e ON strans.emp_id=e.emp_id $CLAUSE GROUP BY s.prod_id, s.sp, TRANS_DATE;");
                $q->execute();  
                return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            else{
                $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(strans.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND s.returned = 1";
                $q = $this->connect()->prepare("SELECT DATE_FORMAT(strans.regdate, '%Y-%m-%d') AS TRANS_DATE, DATE_FORMAT(strans.lastmod, '%r') AS TRANS_TIME, strans.*, s.cp, s.sp, s.qty, (SUM(s.qty)*s.sp) AS EXT_AMT, st.item, e.fullname FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id LEFT JOIN stock st ON s.prod_id=st.prod_id LEFT JOIN employees e ON strans.emp_id=e.emp_id $CLAUSE GROUP BY s.prod_id;");
                $q->execute();  
                return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
        }
        
    }
    $report = new Report();
    
    try{
        // PURCHASES REPORT
        if(isset($_GET['mainRpt']) && !empty($_GET['mainRpt']) && $_REQUEST['mainRpt'] == 2){
            if($_GET['subRpt'] == 0){  
                $json['data'] = $report->purchases(["type" => 0]);
            }            
        }
        // INVENTORY REPORT
        elseif(isset($_GET['mainRpt']) && !empty($_GET['mainRpt']) && $_REQUEST['mainRpt'] == 3){
            if($_GET['subRpt'] == 0){  
                $json['data'] = $report->stock(["type" => 0]);
            }
            elseif($_GET['subRpt'] == 1){                  
                $json['data'] = $report->stock(["type" => 1]);
            }
            elseif($_GET['subRpt'] == 2){  
                $json['data'] = $report->stock(["type" => 2]);
            }
            
        }
        // SALES REPORT
        elseif(isset($_GET['mainRpt']) && !empty($_GET['mainRpt']) && $_REQUEST['mainRpt'] == 4){   
            $json['data'] = $report->sales(["type" => $_GET['subRpt']]);
            // if($_GET['subRpt'] == 0){  
            //     $json['data'] = $report->sales(["type" => 0]);
            // }
            // elseif(!empty($_GET['subRpt']) && $_GET['subRpt'] == 1){                 
            //     $json['data'] = $report->sales(["type" => 1]);
            // }
            // elseif(!empty($_GET['subRpt']) && $_GET['subRpt'] == 2){  
            //     $json['data'] = $report->sales(["type" => 2]);
            // }
            // elseif(!empty($_GET['subRpt']) && $_GET['subRpt'] == 3){  
            //     $json['data'] = $report->sales(["type" => 3]);
            // }
            // elseif(!empty($_GET['subRpt']) && $_GET['subRpt'] == 4){  
            //     $json['data'] = $report->sales(["type" => 4]);
            // }
        }
        // // FINANCE REPORT
        elseif(isset($_GET['mainRpt']) && !empty($_GET['mainRpt']) && $_REQUEST['mainRpt'] == 5){            
            if($_GET['subRpt'] == 0){  
                
            }
        }
        // // EMPLOYEES/STAFF REPORT
        // elseif(isset($_GET['mainRpt']) && !empty($_GET['mainRpt']) && $_REQUEST['mainRpt'] == 6){           
        //     if($_GET['subRpt'] == 0){  
        //         $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND emp_id != 1";
        //         $q = $this->connect()->prepare("SELECT * FROM employees $CLAUSE;");
        //         $q->execute();  
        //         $json['data'] = $q->rowCount(PDO::FETCH_ASSOC) > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        //     }
            
        // }
        // // CUSTOMERS REPORT
        // elseif(isset($_GET['mainRpt']) && !empty($_GET['mainRpt']) && $_REQUEST['mainRpt'] == 7){            
        //     if($_GET['subRpt'] == 0){  
        //         $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(c.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND cust_id != 1";
        //         $q = $this->connect()->prepare("SELECT c.*, IF(photo = '', '../assets/img/avatar.jpg', CONCAT('../uploads/customers/', photo)) AS PHOTO_PATH, cg.title FROM customers c INNER JOIN customer_groups cg ON c.cust_group_id=cg.cust_group_id $CLAUSE;");
        //         $q->execute();  
        //         $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        //     }
        //     elseif($_GET['subRpt'] == 1){  
        //         $CLAUSE = "WHERE IF(!$_GET[allTime], DATE_FORMAT(sl.regdate, '%Y-%m-%d') BETWEEN CAST('$df' AS DATE) AND CAST('$dt' AS DATE), 1) AND sl.returned != 1";
        //         $q = $this->connect()->prepare("SELECT c.cust_name, IF(!$_GET[allTime], DATE_FORMAT(sl.regdate, '%Y-%m-%d') AS TRANS_DATE, sl.qty, sl.sp, sl.priceLabel, sl.um, (sl.qty*sl.sp) AS EXT_AMT, st.item FROM customers c INNER JOIN sales sl ON c.cust_id=sl.cust_id LEFT JOIN stock st ON sl.prod_id=st.prod_id $CLAUSE;");
        //         // $q = $this->connect()->prepare("SELECT c.cust_name, sl.qty, sl.sp, sl.priceLabel, sl.um, SUM(sl.qty*sl.sp) AS EXT_AMT, st.item FROM customers c INNER JOIN sales sl ON c.cust_id=sl.cust_id LEFT JOIN stock st ON sl.prod_id=st.prod_id $CLAUSE GROUP BY c.cust_name;");
        //         $q->execute();    
        //         $json['data'] = $q->rowCount(PDO::FETCH_ASSOC) > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        //     }
        // }
        // else{

        // }
        echo json_encode($json);
    }
    catch (PDOException $e) {
        throw $e->getMessage();
    } 


?>

