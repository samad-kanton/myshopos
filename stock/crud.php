<?php

    require('../model/conn.php');
    require('../model/shared/backend/myUploader.php');

    class Stock extends Db{

        function __construct(){
            // $this->connect()->exec("CREATE TABLE IF NOT EXISTS stock(
            //     id INT AUTO_INCREMENT PRIMARY KEY,
            //     regdate DATETIME DEFAULT NOW(),                
            //     item VARCHAR(100) NOT NULL UNIQUE,
            //     cp DECIMAL(10,2) NOT NULL,
            //     PPQ JSON,
            //     expdate DATE               
            // )");
        }

        function fetch(){
            $q = $this->connect()->prepare("SELECT st.*, cat.* FROM stock st INNER JOIN categories cat ON st.cat_id=cat.cat_id;");
            $q->execute();
            return $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
        }

        function create($params){
            $q = $this->connect()->prepare("INSERT INTO stock(cat_id, item, barcode, qty, cp, ppq, restock, expdate, currency, photos, active, emp_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");
            if($q->execute([$_POST['cat_id'], $_POST['item'], $_POST['barcode'] ?: null, $_POST['qty'] ?: 0, $_POST['cp'] ?: 0, $_POST['ppq'] ?: null, $_POST['restock'] ?: 0, $_POST['expdate'] ?: null, $_POST['currency'], (isset($json['myFileUploaderFiles']) ? json_encode($json['myFileUploaderFiles']) : null), $_POST['isActive'] ?? 0, $_GET['emp_id']])){
                $q2 = $this->connect()->prepare("INSERT INTO orders(prod_id, new_qty, cp, emp_id) VALUES(?, ?, ?, ?)");
                if($q2->execute([$this->connect()->lastInsertId(), $_POST['qty'], $_POST['cp'], $_GET['emp_id']])){
                    return $json['is_uploaded_files'] ? ['filesMoved' => $json['myUploaderFilesMoved']] = $json['myUploader']->move()['filesMoved'][0] : true;
                }
            }
        }

        function update(){
            $json['updatePhotos'] = $json['is_uploaded_files'] ? "'" . json_encode($json['myFileUploaderFiles']) . "'" : ((!$json['is_uploaded_files'] && json_decode($_POST['oldFiles']) != null) ? 'NULL' : "photos");
            $q = $this->connect()->prepare("UPDATE stock SET cat_id=?, item=?, barcode=?, qty=?, cp=?, ppq=?, restock=?, expdate=?, currency=?, photos=$json[updatePhotos], active=?, emp_id=? WHERE prod_id=$_POST[prod_id];");
            if($q->execute([$_POST['cat_id'], $_POST['item'], $_POST['barcode'] ?: "", $_POST['qty'] ?: 0, $_POST['cp'] ?: 0, $_POST['ppq'] ?: null, $_POST['restock'] ?: 0, $_POST['expdate'] ?: null, $_POST['currency'], $_POST['isActive'] ?? 0, $_GET['emp_id']])){
                $json['filesDeleted'] = json_decode($_POST['oldFiles']) ? ['filesDeleted' => $json['myFileUploaderFilesDeleted']] = $json['myUploader']->delete(json_decode($_POST['oldFiles']))['filesDeleted'] : null;
                return $json['is_uploaded_files'] ? ['filesMoved' => $json['myUploaderFilesMoved']] = $json['myUploader']->move()['filesMoved'][0] : true;
            }
        }

        function deActivate(){
            if(isset($_GET['deactivate'])){
                $q = $this->connect()->prepare("UPDATE stock SET active=false WHERE prod_id=:prod_id;");
                return $q->execute([':prod_id' => $_POST['prod_id']]) ? true : $this->connect()->errorInfo();
            }
        }

        function delete(){
            if(isset($_GET['everSold'])){
                $q = $this->connect()->prepare("SELECT * FROM sales WHERE prod_id=$_GET[prod_id];");
                $q->execute();
                $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            $json['filesDeleted'] = ['filesDeleted' => $json['myFileUploaderFilesDeleted']] = $json['myUploader']->delete(json_decode($_POST['photos']))['filesDeleted'][0];
            $q = $this->connect()->prepare("DELETE FROM stock WHERE prod_id=:prod_id;");
            return $q->execute([':prod_id' => $_POST['prod_id']]) ? true : $this->connect()->errorInfo();
        }
    }
    $stock = new Stock();

    $json['is_uploaded_files'] = is_uploaded_file($_FILES['files']['tmp_name'][0]);
    $json['myUploader'] = new MyUploader(['entity' => 'stock', 'files' => $_FILES['files'], 'allowedExts' => array('jpg', 'jpeg', 'png')]);    
    if((isset($_FILES['files']) && is_uploaded_file($_FILES['files']['tmp_name'][0])) || isset($_GET['deleteORdeactivate'])){
        ['names' => $json['myFileUploaderFiles']] = $json['is_uploaded_files'] ? $json['myUploader']->fileObj() : null;
    }

    try{
        if(isset($_GET['stocks'])){
            if(isset($_GET['pop'])){
                $json['data'] = $stock->fetch();
            }        
            elseif(isset($_GET['new'])){
                // $json['data'] = $_REQUEST;
                $json['saved'] = $stock->create();
            }
            elseif(isset($_GET['update'])){
                // $json['data'] = $_REQUEST;
                // $json['oldFiles'] = json_decode($_POST['oldFiles']) ?: null;
                $json['updated'] = $stock->update();
            }
            elseif(isset($_GET['deleteORdeactivate'])){
                // $json['data'] = $_REQUEST;
                isset($_GET['deactivate']) ? $json['deactivated'] = $stock->deActivate() : ''; 
                isset($_GET['delete']) ? $json['deleted'] = $stock->delete() : ''; 
            }
        }
        elseif(isset($_GET['topup'])){
            if(isset($_GET['pop'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("SELECT st.prod_id, st.item, st.ppq, o.*, o.new_qty AS qty, DATE_FORMAT(o.regdate, '%Y-%m-%d') AS ORDER_DATE, (o.prev_qty+o.new_qty) AS CUR_QTY, (o.cp*o.new_qty) AS EXT_AMT FROM stock st RIGHT JOIN orders o ON st.prod_id=o.prod_id WHERE st.prod_id=$_GET[prod_id] ORDER BY st.item DESC;");
                $q->execute();
                $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif(isset($_GET['increase'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("UPDATE stock SET qty=qty+$_POST[topupQty], cp=$_POST[topupCP] WHERE prod_id=$_POST[prod_id];");
                if($q->execute()){
                    $q2 = $con->prepare("INSERT INTO orders(prod_id, prev_qty, new_qty, cp, emp_id) VALUES(?, ?, ?, ?, ?)");
                    $json['updated'] = $q2->execute([$_POST['prod_id'], $_POST['qty'], $_POST['topupQty'], $_POST['topupCP'], $_GET['emp_id']]) ? true : $con->errorInfo();
                }
                else{
                    $json['updated'] = $con->errorInfo();
                }
            }
            elseif(isset($_GET['update'])){
                $json['data'] = $_REQUEST;
                // $q = $con->prepare("UPDATE orders SET new_qty=new_qty+'$_POST[diff]' WHERE prod_id=$_POST[prod_id];");
                // if($q->execute()){
                //     $q2 = $con->prepare("UPDATE stock SET qty=qty+'$_POST[diff]' WHERE prod_id=$_POST[prod_id];");
                //     $json['updated'] = $q2->execute() ? true : $con->errorInfo();
                // }
                // else{
                //     $json['updated'] = $con->errorInfo();
                // }
            }
            elseif(isset($_GET['delete'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("DELETE FROM orders WHERE order_id=$_POST[order_id];");
                if($q->execute()){
                    $q2 = $con->prepare("UPDATE stock SET qty=qty-$_POST[topupQty] WHERE prod_id=$_POST[prod_id];");
                    $json['deleted'] = $q2->execute() ? true : $con->errorInfo();
                }
            }
        }
        elseif (isset($_GET['stockTaking'])) {
            if(isset($_GET['popCount'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("SELECT * FROM stock_count WHERE period_qtr=? AND period_year=?;");
                $q->execute([$_POST['period_qtr'], $_POST['period_year']]);
                $json['data'] = $q->rowCount() > 0 ? $q->fetchAll(PDO::FETCH_ASSOC) : 0;
            }
            elseif(isset($_GET['count'])){
                // $json['data'] = $_REQUEST;
                $q = $con->prepare("SELECT * FROM stock_count WHERE prod_id=? AND period_qtr=? AND period_year=?;");
                $q->execute([$_POST['prod_id'], $_POST['period_qtr'], $_POST['period_year']]);
                if($q->rowCount() < 1){
                    $q2 = $con->prepare("INSERT INTO stock_count(period_qtr, period_year, prod_id, physical_count, damaged_count, emp_id) VALUES(?, ?, ?, ?, ?, ?);");
                    $json['saved'] = $q2->execute([$_POST['period_qtr'], $_POST['period_year'], $_POST['prod_id'], $_POST['physical_count'], $_POST['damaged_count'], $_GET['emp_id']]) ? true : $con->errorInfo(); 
                }
                else{
                    $q = $con->prepare("UPDATE stock_count SET $_POST[col]='$_POST[newValue]' WHERE prod_id=? AND period_qtr=? AND period_year=?;");
                    $json['updated'] = $q->execute([$_POST['prod_id'], $_POST['period_qtr'], $_POST['period_year']]) ? true : $con->errorInfo(); 
                }
            }
        }
    } catch (PDOException $e) {
        $json['data'] = "Error: " . $e->getMessage();
    }

    echo json_encode($json);

?>
