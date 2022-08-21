<?php
    require('../model/conn.php');

    $uploads_dir = "../uploads/customers/";

    try{
        if(isset($_GET['customerGroup'])){
            if(isset($_GET['pop'])){
                $q = $con->prepare("SELECT * FROM customer_groups;");
                $q->execute();
                $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif(isset($_GET['new'])){                
                $q = $con->prepare("INSERT INTO customer_groups(title, emp_id) VALUES(?, ?);");
                $json['saved'] = $q->execute([$_POST['groupTitle'], $_GET['empID']]) ? true : $con->errorInfo();  
            }
            elseif(isset($_GET['del'])){
                $q = $con->prepare("DELETE FROM customer_groups WHERE cust_group_id=:cust_group_id;");
                $json['deleted'] = $q->execute([':cust_group_id' => $_POST['key']]) ? true : false;
            }            
        }
        else{
            if(isset($_GET['new']) || isset($_GET['update'])){
                $json['newFileName'] = "";
                if(!empty($_FILES['photo']['name'])){
                    $json['pathInfo'] = ['name' => $_FILES['photo']['name'], 'tmp_name' => $_FILES['photo']['tmp_name'], 'type' => explode('/', $_FILES['photo']['type'])[1]];
                    $json['newFileName'] = bin2hex(random_bytes(3)) . time() . "." . $json['pathInfo']['type'];
                    $json['source'] = $json['pathInfo']['tmp_name'];
                    $json['dest'] = "$uploads_dir/" . $json['newFileName'];
                    $json['editOldFileName'] = $_GET['oldFile'] ?? ("$uploads_dir/" . $_GET['oldFile']) ?: null;
                }
                $json['addr'] = [
                    'contactAddr' => [
                        'cust_phone' => $_POST['cust_phone'] ?? '', 
                        // 'cust_mobile' => !empty($_POST['cust_mobile']) ? $_POST['cust_mobile'] : 'null',
                        'cust_email' => $_POST['cust_email'] ?? ''
                    ],
                    'locationAddr' => [
                        'cust_country' => $_POST['cust_country'] ?? '',
                        'cust_zipcode' => $_POST['cust_zipcode'] ?? '',
                        'cust_addr' => $_POST['cust_addr'] ?? ''
                    ]
                ];
            }

            if(isset($_GET['pop'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("SELECT c.*, (SELECT IFNULL(SUM(s.qty*s.sp), 0) FROM sales_trans strans INNER JOIN sales s ON strans.strans_id=s.strans_id WHERE strans.cust_id=c.cust_id) AS CUST_TILL, (SELECT COUNT(strans_id)) AS CUST_VISITS FROM customers c LEFT JOIN sales_trans strans ON c.cust_id=strans.cust_id WHERE c.active=1 GROUP BY c.cust_id ORDER BY cust_id DESC;");
                $q->execute();
                $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif(isset($_GET['new'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("INSERT INTO customers(cust_group_id, cust_name, cust_tin, credit_limit, apm, addr, photo, is_default, emp_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);");
                !empty($json['newFileName']) ? move_uploaded_file($json['source'], $json['dest']) : '';  
                $json['saved'] = $q->execute([$_POST['cust_group'], ucwords($_POST['cust_name']), $_POST['cust_tin'] ?? '', $_POST['cust_creditLimit'] ?: 0, $_POST['allowed_payment_methods'], json_encode($json['addr'], JSON_FORCE_OBJECT), $json['newFileName'], $_POST['isDefaultCustomer'] ?? 0, $_GET['empID']]) ? true : $con->errorInfo();
            }
            elseif(isset($_GET['update'])){
                $json['data'] = $_REQUEST;
                !empty($json['editOldFileName']) && file_exists($json['editOldFileName']) ? unlink($json['editOldFileName']) : "File path does not exist";
                $json['isDefaultCustomer'] = isset($_POST['isDefaultCustomer']) ? 0 : 'is_default';
                $q = $con->prepare("UPDATE customers SET is_default=$json[isDefaultCustomer]; UPDATE customers SET cust_group_id=?, cust_name=?, cust_tin=?, credit_limit=?, apm=?, addr=?, photo=?, is_default=?, emp_id=? WHERE cust_id=$_GET[key];");
                !empty($json['newFileName']) ? move_uploaded_file($json['source'], $json['dest']) : '';  
                $json['updated'] = $q->execute([$_POST['cust_group'], $_POST['cust_name'], $_POST['cust_tin'] ?? '', $_POST['cust_creditLimit'] ?: 0, $_POST['allowed_payment_methods'], json_encode($json['addr'], JSON_FORCE_OBJECT), $json['newFileName'], $_POST['isDefaultCustomer'] ?? 0, $_GET['empID']]) ? true : $con->errorInfo(); 
            }
            elseif(isset($_GET['delete'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("UPDATE customers SET active=0 WHERE cust_id=?;");
                $json['deleted'] = $q->execute([$_POST['cust_id']]) ? true : false;
            }
            else{
                // $json['data'] = "hello";
            }
        }   
    } catch (PDOException $e) {
        $json['data'] = $e->getMessage();
    }

    echo json_encode($json);

?>