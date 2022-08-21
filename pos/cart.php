<?php

    require('../model/conn.php');

    class ShoppingCart extends Db {

        private $payLoad;

        function __construct(){
            $this->payLoad = json_decode(file_get_contents('php://input'), true);
        }

        function genTransId($customTransDate){  
            $q = $this->connect()->prepare("SELECT strans_id FROM sales_trans ORDER BY strans_id DESC LIMIT 1;"); 
            $q->execute();
            $row = $q->fetch();
            return date(('ymd'), strtotime($customTransDate)) . ($q->rowCount() < 1 ? 1 : ++$row[0]);
        }

        function checkOut(){  
            $json['distinctCart'] = array();
            if(!empty($this->payLoad['processTrans'])){
                $json['extCartOpts'] = json_decode($this->payLoad['extCartOpts']);
                // REFORM CART ITEMS INTO DISTINCT VALUES
                foreach ($this->payLoad['cart'] as $key => $value) {
                    $json['idx'] = array_search($value['item'], array_column($json['distinctCart'], 'item'));
                    if(in_array(strtolower($value['item']), array_column($json['distinctCart'], 'item'))){
                        $json['distinctCart'][$json['idx']]['qty'] += ($value['dim'] * $value['qty']);
                    }
                    else{
                        array_push($json['distinctCart'], ['id' => $value['id'], 'item' => $value['item'], 'qty' => ($value['dim'] * $value['qty'])]);
                    }
                }
                // VALIDATE REFORMED-CART ITEM QTY's
                for ($i = 0; $i < count($json['distinctCart']); $i++) { 
                    $q = $this->connect()->prepare("SELECT * FROM stock WHERE prod_id=? AND (qty-? < 0);");
                    $q->execute([$json['distinctCart'][$i]['id'], $json['distinctCart'][$i]['qty']]);
                    $q->rowCount() ? $json['qtyOverSell'][] = $q->fetch() : [];
                }
                // PROCESS TRANSACTION
                if(!isset($json['qtyOverSell'])){     
                    // $json['transID'] = substr(genTransId($this->payLoad['transDate']), 6);
                    $json['regdate'] = $this->payLoad['transDate'] . ' ' . date(('H:i:s'), strtotime('now'));
                    $q = $this->connect()->prepare("INSERT INTO sales_trans(regdate, received, balance, pm_id, cust_id, vat_discount, receiptPref, emp_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)");
                    if($q->execute([$json['regdate'], $this->payLoad['received'], $this->payLoad['balance'], $this->payLoad['pm_id'], $this->payLoad['cust_id'], json_encode($json['extCartOpts']), json_encode($this->payLoad['receiptPref']), $this->payLoad['emp_id']])){
                        $json['transID'] = $this->connect()->lastInsertId(); // GET ID OF LAST INSERTED TRANS ID ON CONNECTION
                        foreach ($this->payLoad['cart'] as $key => $value) { 
                            $q2 = $this->connect()->prepare("UPDATE stock SET qty=qty-:qty WHERE prod_id=:prod_id;");
                            if($q2->execute([':prod_id' => $value['id'], ':qty' => ($value['qty']*$value['dim'])])){                  
                                $q3 = $this->connect()->prepare("INSERT INTO sales(strans_id, prod_id, priceLabel, dim, qty, cp, sp, amt) VALUES(?, ?, ?, ?, ?, ?, ?, ?)");
                                if($q3->execute([$json['transID'], $value['id'], $value['priceLabel'], $value['dim'], $value['qty'], $value['cp'], $value['rate'], $this->payLoad['amtDue']])){
                                    $json['sold'] = true;
                                }
                                else{
                                    $json['sold'] = false;
                                    $json['err'] = $this->connect()->error;
                                }
                            }
                        } 
                    } 
                }
            }
            return $json['sold'];
        }

        function return(){ 
            return array_map(function($value) {
                return $this->connect()->prepare("UPDATE sales SET returned=1 WHERE strans_id=$value[strans_id] AND prod_id=$value[prod_id];")->execute() && $this->connect()->prepare("UPDATE stock SET qty=qty+($value[qty] * $value[dim]) WHERE prod_id=$value[prod_id];")->execute() ? true : $this->connect()->error;
            }, $_REQUEST['selItems'])[0];
        }

    }
    $shoppingCart = new ShoppingCart();

    try {          

        if(!empty($_GET['NextTransID']) && $_GET['NextTransID'] && filter_input(INPUT_GET, 'NextTransID', FILTER_VALIDATE_BOOLEAN) == true){
            $json['trans_id'] = $shoppingCart->genTransId($_GET['customTransDate']);
        }
        else{
            if(isset($_GET['returnSale'])){
                $json['returned'] = $shoppingCart->return();
            }    
            else{
                $json['sold'] = $shoppingCart->checkOut();
            }
        }        
    }
    catch(PDOException $e){
        $json['err'] = $e->getMessage();
    }

    echo json_encode($json);

?>