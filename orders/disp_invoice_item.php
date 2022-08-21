<?php
    require('../../model/conn.php');
    $data = '';
    $amt = 0;
    $invoice_date = date(('M d Y h:ia'), strtotime($_POST['regdate']));
    try{
        // $q = $con->prepare("SELECT o.invoice, o.prod_id, o.qty_wh AS QTY_WH, st.* FROM orders o INNER JOIN stock st ON o.prod_id=st.prod_id WHERE o.invoice = :invoice_id ORDER BY st.item;");
        $q = $con->prepare("SELECT * FROM stcok ORDER By item ASC;");
        $q->execute([':invoice_id' => $_POST['invoice_id']]);
        if ($q->rowCount() > 0) {
            $data .= "
                        <div class='table-responsive' style='margin: 0;'>
                            <table class='table table-default'>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th style='text-align: right;'>Qty</th>
                                        <th style='text-align: right;'>Unit Cost</th>
                                        <th style='text-align: right;'>Ext. Price</th>
                                    </tr>
                                <thead>
                                <tbody>
            ";
            while($row = $q->fetch()){
                $amt += $row['QTY_WH'] * $row['cp'];
                $data .= "          
                                <tr>
                                    <td hidden>$row[invoice]</td>
                                    <td>" . strtoupper($row['item']) . "</td>
                                    <td class='txt-right'>$row[QTY_WH]</td>
                                    <td class='txt-right'>$row[cp]</td>
                                    <td class='txt-right'>" . number_format($row['QTY_WH'] * $row['cp'], 2) . "</td>                                    
                                </tr>
                ";
            }               
            $data .= "          </tbody>
                                <tfoot>
                                    <tr hidden><td colspan='4'><iframe width='100%'></iframe></td></tr>
                                    <tr>
                                        <td colspan='2'><b>Date</b> : <span>$invoice_date</span></td>
                                        <td><button type='button' class='btn btn-primary btn-small' onclick=\"$(this).closest('table').find('tfoot tr:first iframe').prop('src', './print_purchase_order_invoice.php?invoice='+$(this).closest('table').find('tbody td:first').text()+'&invoice_date='+$(this).closest('table').find('tfoot tr:last td:first span').text()+'&supplier=$_POST[supplier]');\"><i class='fa fa-print'></i> Print</button></td>
                                        <td align='right'><b>Total</b> = &#x20b5;" . number_format($amt, 2) . "</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>";
        }
        else{
            
        }
    } catch (PDOException $e) {
        $data = "Error executing query" . $e->getMessage();
    }

    echo $data;

?>