<?php

    require('../../model/conn.php');

    // echo "Invoice = " . $_GET['invoice'];
    $data = '';
    $amt = 0;

    $q = $con->prepare("SELECT o.invoice, o.prod_id, o.qty_wh AS QTY_WH, st.* FROM orders o INNER JOIN stock st ON o.prod_id=st.prod_id WHERE o.invoice = :invoice_id ORDER BY st.item;");
    $q->execute([':invoice_id' => $_GET['invoice']]);
    if ($q->rowCount() > 0) {
        $data .= "
                    <div class='table-responsive' style='margin: 0;'>
                        <div style='text-align: center; border: dashed 2px #000;'>
                            <h1 style='text-align: center; border-bottom: solid 1px #000;'>ALLURE PHARMACY</h1>
                            <div style='display: flex; justify-content: space-between; padding: 0 20px 20px 20px;'>
                                <span style='font-size: 17pt; text-align: left;'><b>Supplier:</b> <br/>$_GET[supplier]</span>
                                <span style='font-size: 17pt; text-align: left;'><b>Invoice:</b> <br/>$_GET[invoice]</span>
                            </div>
                        </div>
                        <table class='table table-default' style='width: 100%;' border='1' cellpadding='7'>
                            <thead>
                                <tr>
                                    <th align='left'>S/No</th>
                                    <th align='left'>Description</th>
                                    <th align='right'>Qty</th>
                                    <th align='right'>Unit Cost</th>
                                    <th align='right'>Ext. Price</th>
                                </tr>
                            <thead>
                            <tbody>
        ";
        $count = 0;
        while ($row = $q->fetch()) {
            ++$count;
            $amt += $row['QTY_WH'] * $row['cp'];
            $data .= "          
                            <tr>
                                <td>$count.</td>
                                <td>" . strtoupper($row['item']) . "</td>
                                <td align='right'>$row[QTY_WH]</td>
                                <td align='right'>$row[cp]</td>
                                <td align='right'>" . number_format($row['QTY_WH'] * $row['cp'], 2) . "</td>                                    
                            </tr>
            ";
        }  
        $data .= "          </tbody>
                <tfoot>
                    <tr>
                        <td colspan='4'><b>Date</b> : $_GET[invoice_date]</td>
                        <td align='right'><b>Total</b> = &#x20b5;" . number_format($amt, 2) . "</td>
                    </tr>
                </tfoot>
            </table>
        </div>";
    }

    echo $data;

?>

<script>
    window.print();
</script>