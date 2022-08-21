<?php
    // session_start();
    require('../../model/conn.php');

    $data = "";

    $perPage = !(int)protect('perPage', FILTER_VALIDATE_INT) ? 'all' : (int)protect('perPage', FILTER_VALIDATE_INT);    
    $reqPage = !protect('reqPage', FILTER_VALIDATE_INT) ? 1 : protect('reqPage', FILTER_VALIDATE_INT);
    $viewingPage = $perPage == 0 ? 0 : ($reqPage-1) * $perPage; 

    $filter_column = !empty(protect('filter_column', FILTER_SANITIZE_STRING)) ? protect('filter_column', FILTER_SANITIZE_STRING) : "";
    $search_term = !empty(protect('search_term', FILTER_SANITIZE_STRING)) ? protect('search_term', FILTER_SANITIZE_STRING) : "";
    $search_term = htmlspecialchars_decode($search_term);

    try{
        if ($search_term) {
            if ($filter_column && $filter_column == "all") {
                if($perPage && $perPage == "all"){
                    $q = $con->prepare("SELECT DISTINCT(o.invoice), s.sup_name, st.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id INNER JOIN stock st ON o.prod_id=st.prod_id WHERE o.invoice LIKE :invoice OR s.sup_name LIKE :supplier OR st.item LIKE :item GROUP BY invoice ORDER BY order_id DESC;");
                    $q->execute([':invoice' => '%'. $search_term . '%', ':supplier' => '%'. $search_term . '%', ':item' => '%'. $search_term . '%']);
                    $q->setFetchMode(PDO::FETCH_ASSOC);
                    if($q->rowCount() > 0){
                        $data .= "<div class='row' style='position: relative;'>";
                        while ($row = $q->fetch()) {
                            $data .= "
                                        <div class='cl-12 cm-12 cs-12 cx-12'>  
                                            <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                                <span hidden id='regdate'>$row[regdate]</span>
                                                <div class='panel-content bg-default' style='border-radius: 0;'>
                                                    <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                    <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            ";
                        }   
                        $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";    
                    }
                    else{
                        $data = "<div class='row bg-danger center-block'><h3 class='txt-danger'>Sorry! You have no tock available at the moment.</h3></div>";            
                    }
                }
                else{
                    $q = $con->prepare("SELECT DISTINCT(o.invoice), s.sup_name, st.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id INNER JOIN stock st ON o.prod_id=st.prod_id WHERE o.invoice LIKE :invoice OR s.sup_name LIKE :supplier OR st.item LIKE :item GROUP BY invoice ORDER BY order_id DESC LIMIT $viewingPage, $perPage;");
                    $q->execute([':invoice' => '%'. $search_term . '%', ':supplier' => '%'. $search_term . '%', ':item' => '%'. $search_term . '%']);
                    if ($q->rowCount() > 0) {
                        $data .= "<div class='row' style='position: relative;'>";
                        while ($row = $q->fetch()) {
                            $data .= "
                                        <div class='cl-12 cm-12 cs-12 cx-12'>  
                                            <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                                <span hidden id='regdate'>$row[regdate]</span>
                                                <div class='panel-content bg-default' style='border-radius: 0;'>
                                                    <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                    <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            ";
                        }
                        $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";
                        $q = $con->prepare("SELECT DISTINCT(o.invoice), s.sup_name, st.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id INNER JOIN stock st ON o.prod_id=st.prod_id WHERE o.invoice LIKE :invoice OR s.sup_name LIKE :supplier OR st.item LIKE :item GROUP BY invoice ORDER BY order_id DESC;");
                        $q->execute([':invoice' => '%'. $search_term . '%', ':supplier' => '%'. $search_term . '%', ':item' => '%'. $search_term . '%']);
                        $numPages = ceil($q->rowCount() / $perPage);
                        $data .= "<div style='width: 100%; margin: 0 10px; display: grid; grid-template-columns: auto auto; justify-content: space-between;'><span style='margin: 10px 0; font-size: 20px;'>Page $reqPage of $numPages</span><ul class='pagination pull-right'>";
                        $prev = $viewingPage == 0 ? "disabled" : "";
                        $prevPage = $reqPage == '' ? 1 : $reqPage-1;
                        $data .= "<li class='pagination-item $prev' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$prevPage}, \"#pop_invoice_table\");'>&laquo;</li>";
                        for($i=1; $i <= $numPages; $i++){  
                            $active = $i == (($viewingPage / $perPage) + 1) ? 'active' : '';
                            $data .= "<li class='pagination-item $active' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$(this).text()}, \"#pop_invoice_table\");'>$i</li>";
                        }
                        $next = $reqPage == $numPages ? "disabled" : "";
                        $nextPage = $reqPage == '' ? 1 : $reqPage+1;
                        $data .= "<li class='pagination-item $next' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$nextPage}, \"#pop_invoice_table\");'>&raquo;</li>";
                        $data .= "</ul></div>";               
                    }
                    else{
                        $data = "<div class='row bg-danger center-block'><h3 class='txt-danger'>Sorry! Your search term did not match any record.</h3></div>";    
                    }
                }
            }
            elseif ($filter_column && $filter_column == "invoice") {
                if($perPage && $perPage == "all"){
                    $q = $con->prepare("SELECT DISTINCT(o.invoice), s.sup_name FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id WHERE o.invoice LIKE :invoice GROUP BY invoice ORDER BY order_id DESC;");
                    $q->execute([':invoice' => '%'. $search_term . '%']);
                    $q->setFetchMode(PDO::FETCH_ASSOC);
                    if($q->rowCount() > 0){
                        $data .= "<div class='row' style='position: relative;'>";
                        while ($row = $q->fetch()) {
                            $data .= "
                                        <div class='cl-12 cm-12 cs-12 cx-12'>  
                                            <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                                <span hidden id='regdate'>$row[regdate]</span>
                                                <div class='panel-content bg-default' style='border-radius: 0;'>
                                                    <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                    <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            ";
                        }  
                        $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";    
                    }
                    else{
                        $data = "<div class='row bg-danger center-block'><h3 class='txt-danger'>Sorry! Your search term did not match any record.</h3></div>";         
                    }
                }
                else{
                    $q = $con->prepare("SELECT DISTINCT(o.invoice), s.sup_name, st.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id INNER JOIN stock st ON o.prod_id=st.prod_id WHERE o.invoice LIKE :invoice GROUP BY invoice ORDER BY order_id DESC LIMIT $viewingPage, $perPage;");
                    $q->execute([':invoice' => '%'. $search_term . '%']);
                    $q->setFetchMode(PDO::FETCH_ASSOC);
                    if($q->rowCount() > 0){
                        $data .= "<div class='row' style='position: relative;'>";
                        while ($row = $q->fetch()) {
                            $data .= "
                                        <div class='cl-12 cm-12 cs-12 cx-12'>  
                                            <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                                <span hidden id='regdate'>$row[regdate]</span>
                                                <div class='panel-content bg-default' style='border-radius: 0;'>
                                                    <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                    <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            ";
                        }  
                        $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";
                        $q = $con->prepare("SELECT DISTINCT(o.invoice), s.sup_name, st.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id INNER JOIN stock st ON o.prod_id=st.prod_id WHERE o.invoice LIKE :invoice GROUP BY invoice ORDER BY order_id DESC;");
                        $q->execute([':invoice' => '%'. $search_term . '%']);
                        $numPages = ceil($q->rowCount() / $perPage);
                        $data .= "<div style='width: 100%; margin: 0 10px; display: grid; grid-template-columns: auto auto; justify-content: space-between;'><span style='margin: 10px 0; font-size: 20px;'>Page $reqPage of $numPages</span><ul class='pagination pull-right'>";
                        $prev = $viewingPage == 0 ? "disabled" : "";
                        $prevPage = $reqPage == '' ? 1 : $reqPage-1;
                        $data .= "<li class='pagination-item $prev' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$prevPage}, \"#pop_invoice_table\");'>&laquo;</li>";
                        for($i=1; $i <= $numPages; $i++){  
                            $active = $i == (($viewingPage / $perPage) + 1) ? 'active' : '';
                            $data .= "<li class='pagination-item $active' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$(this).text()}, \"#pop_invoice_table\");'>$i</li>";
                        }
                        $next = $reqPage == $numPages ? "disabled" : "";
                        $nextPage = $reqPage == '' ? 1 : $reqPage+1;
                        $data .= "<li class='pagination-item $next' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$nextPage}, \"#pop_invoice_table\");'>&raquo;</li>";
                        $data .= "</ul></div>";  
                    }
                    else{
                        $data = "<div class='row bg-danger center-block'><h3 class='txt-danger'>Sorry! Your search term did not match any record.</h3></div>";  
                    }
                }
            }
            elseif ( $filter_column && $filter_column == "supplier") {
                if($perPage && $perPage == "all"){
                    $q = $con->prepare("SELECT *, s.sup_name FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id WHERE s.sup_name LIKE :supplier GROUP BY invoice ORDER BY order_id DESC;");
                    $q->execute([':supplier' => '%'. $search_term . '%']);
                    $q->setFetchMode(PDO::FETCH_ASSOC);
                    if($q->rowCount() > 0){
                        $data .= "<div class='row' style='position: relative;'>";
                        while ($row = $q->fetch()) {
                            $data .= "
                                        <div class='cl-12 cm-12 cs-12 cx-12'>  
                                            <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                                <span hidden id='regdate'>$row[regdate]</span>
                                                <div class='panel-content bg-default' style='border-radius: 0;'>
                                                    <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                    <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            ";
                        } 
                        $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";
                    }
                    else{
                        $data = "<div class='row bg-danger center-block'><h3 class='txt-danger'>Sorry! Your search term did not match any record.</h3></div>";         
                    }
                }
                else{
                    $q = $con->prepare("SELECT DISTINCT(o.invoice), s.sup_name, o.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id WHERE s.sup_name LIKE :supplier GROUP BY invoice ORDER BY order_id DESC LIMIT $viewingPage, $perPage;");
                    $q->execute([':supplier' => '%'. $search_term . '%']);
                    $q->setFetchMode(PDO::FETCH_ASSOC);
                    if($q->rowCount() > 0){
                        $data .= "<div class='row' style='position: relative;'>";
                        while ($row = $q->fetch()) {
                            $data .= "
                                        <div class='cl-12 cm-12 cs-12 cx-12'>  
                                            <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                                <span hidden id='regdate'>$row[regdate]</span>
                                                <div class='panel-content bg-default' style='border-radius: 0;'>
                                                    <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                    <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            ";
                        }  
                        $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";
                        $q = $con->prepare("SELECT *, s.sup_name FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id WHERE s.sup_name LIKE :supplier GROUP BY invoice ORDER BY order_id DESC;");
                        $q->execute([':supplier' => '%'. $search_term . '%']);
                        $numPages = ceil($q->rowCount() / $perPage);
                        $data .= "<div style='width: 100%; margin: 0 10px; display: grid; grid-template-columns: auto auto; justify-content: space-between;'><span style='margin: 10px 0; font-size: 20px;'>Page $reqPage of $numPages</span><ul class='pagination pull-right'>";
                        $prev = $viewingPage == 0 ? "disabled" : "";
                        $prevPage = $reqPage == '' ? 1 : $reqPage-1;
                        $data .= "<li class='pagination-item $prev' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$prevPage}, \"#pop_invoice_table\");'>&laquo;</li>";
                        for($i=1; $i <= $numPages; $i++){  
                            $active = $i == (($viewingPage / $perPage) + 1) ? 'active' : '';
                            $data .= "<li class='pagination-item $active' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$(this).text()}, \"#pop_invoice_table\");'>$i</li>";
                        }
                        $next = $reqPage == $numPages ? "disabled" : "";
                        $nextPage = $reqPage == '' ? 1 : $reqPage+1;
                        $data .= "<li class='pagination-item $next' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$nextPage}, \"#pop_invoice_table\");'>&raquo;</li>";
                        $data .= "</ul></div>";  
                    }
                    else{
                        $data = "<div class='row bg-danger center-block'><h3 class='txt-danger'>Sorry! Your search term did not match any record.</h3></div>";  
                    }
                }
            }
            elseif ( $filter_column && $filter_column == "item") {
                if($perPage && $perPage == "all"){
                    $q = $con->prepare("SELECT *, s.sup_name, st.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id INNER JOIN stock st ON o.prod_id=st.prod_id WHERE st.item LIKE :item GROUP BY invoice ORDER BY order_id DESC;");
                    $q->execute([':item' => '%'. $search_term . '%']);
                    $q->setFetchMode(PDO::FETCH_ASSOC);
                    if($q->rowCount() > 0){
                        $data .= "<div class='row' style='position: relative;'>";
                        while ($row = $q->fetch()) {
                            $data .= "
                                        <div class='cl-12 cm-12 cs-12 cx-12'>  
                                            <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                                <span hidden id='regdate'>$row[regdate]</span>
                                                <div class='panel-content bg-default' style='border-radius: 0;'>
                                                    <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                    <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            ";
                        } 
                        $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";
                    }
                    else{
                        $data = "<div class='row bg-danger center-block'><h3 class='txt-danger'>Sorry! Your search term did not match any record.</h3></div>";         
                    }
                }
                else{
                    $q = $con->prepare("SELECT *, s.sup_name, st.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id INNER JOIN stock st ON o.prod_id=st.prod_id WHERE st.item LIKE :item GROUP BY invoice ORDER BY order_id DESC LIMIT $viewingPage, $perPage;");
                    $q->execute([':item' => '%'. $search_term . '%']);
                    $q->setFetchMode(PDO::FETCH_ASSOC);
                    if($q->rowCount() > 0){
                        $data .= "<div class='row' style='position: relative;'>";
                        while ($row = $q->fetch()) {
                            $data .= "
                                        <div class='cl-12 cm-12 cs-12 cx-12'>  
                                            <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                                <span hidden id='regdate'>$row[regdate]</span>
                                                <div class='panel-content bg-default' style='border-radius: 0;'>
                                                    <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                    <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                            ";
                        }                          
                        $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";
                        $q = $con->prepare("SELECT *, s.sup_name, st.* FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id INNER JOIN stock st ON o.prod_id=st.prod_id WHERE st.item LIKE :item GROUP BY invoice ORDER BY order_id DESC;");
                        $q->execute([':item' => '%'. $search_term . '%']);
                        $numPages = ceil($q->rowCount() / $perPage);
                        $data .= "<div style='width: 100%; margin: 0 10px; display: grid; grid-template-columns: auto auto; justify-content: space-between;'><span style='margin: 10px 0; font-size: 20px;'>Page $reqPage of $numPages</span><ul class='pagination pull-right'>";
                        $prev = $viewingPage == 0 ? "disabled" : "";
                        $prevPage = $reqPage == '' ? 1 : $reqPage-1;
                        $data .= "<li class='pagination-item $prev' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$prevPage}, \"#pop_invoice_table\");'>&laquo;</li>";
                        for($i=1; $i <= $numPages; $i++){  
                            $active = $i == (($viewingPage / $perPage) + 1) ? 'active' : '';
                            $data .= "<li class='pagination-item $active' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$(this).text()}, \"#pop_invoice_table\");'>$i</li>";
                        }
                        $next = $reqPage == $numPages ? "disabled" : "";
                        $nextPage = $reqPage == '' ? 1 : $reqPage+1;
                        $data .= "<li class='pagination-item $next' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$nextPage}, \"#pop_invoice_table\");'>&raquo;</li>";
                        $data .= "</ul></div>";  
                    }
                    else{
                        $data = "<div class='row bg-danger center-block'><h3 class='txt-danger'>Sorry! Your search term did not match any record.</h3></div>";  
                    }
                }
            }
        }
        else{
            if($perPage && $perPage == "all"){
                $q = $con->prepare("SELECT DISTINCT invoice FROM orders;");
                $q->execute();
                if ($q->rowCount() > 0) {
                    $data .= "<div class='row' style='position: relative;'>";
                    while ($row = $q->fetch()) {
                        $q2 = $con->prepare( "SELECT o.*, s.*, (SELECT regdate FROM orders WHERE order_id=o.order_id) As regdate FROM orders o INNER JOIN supplier s ON o.sup_id=s.sup_id WHERE invoice=:invoice;");
                        $q2->execute([':invoice' => $row['invoice']]);
                        $row2 = $q2->fetch();
                        $data .= "
                                    <div class='cl-12 cm-12 cs-12 cx-12'>  
                                        <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                                            <span hidden id='regdate'>$row2[regdate]</span>
                                            <div class='panel-content bg-default' style='border-radius: 0;'>
                                                <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$row[invoice]\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row2[sup_name]</span> <span class='clr-teal'> $row[invoice] &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                                                <div hidden class='panel-content' id='id$row[invoice]' style='border-radius: 0;'>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                        ";
                    }   
                    $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";    
                }
                else{
                    $data = "<td colspan='8' class='bg-danger'><h3 class='txt-danger txt-center'>No record found!</h3></td>";            
                }
            }
            else{
                // $q = $con->prepare("SELECT * FROM stock ORDER BY item DESC LIMIT $viewingPage, $perPage;");
                // $q->execute();
                // if($q->rowCount() > 0){
                //     $data .= "<div class='row' style='position: relative;'>";
                //     while ($row = $q->fetch()) {
                //         // $row = $q2->fetch();
                //         $data .= "
                //                     <div class='cl-12 cm-12 cs-12 cx-12'>  
                //                         <div class='panel' id='panel-invoice-list' style='border-radius: 0; margin: 0;'>
                //                             <span hidden id='regdate'>$row[regdate]</span>
                //                             <div class='panel-content bg-default' style='border-radius: 0;'>
                //                                 <button type='button' class='btn btn-info btn-lg btn-block' onclick='disp_invoice_items(\"$invoice\");'><span class='clr-teal'><i class='fa fa-circle'></i> $row[sup_name]</span><span class='clr-teal'> $invoice &nbsp;&nbsp;&nbsp;<i class='fa fa-chevron-up clr-teal'></i></span></button>
                //                                 <div hidden class='panel-content' id='id$invoice' style='border-radius: 0;'>
                                                    
                //                                 </div>
                //                             </div>
                //                         </div>
                //                     </div>
                //         ";
                //     }
                //     $data .= "<div class='image-loader' style='position: absolute; top: 0; bottom: 0; width: 100%; display: flex; flex-flow: column; justify-content: center; align-items: center; background: transparent; display: none;'><img src='../../assets/img/loading.gif' alt='' width='76px' height='76px' /><p><span class='clr-teal'>Loading...</span></div></div>";
                //     $q = $con->prepare("SELECT DISTINCT invoice FROM orders ORDER BY order_id DESC;");
                //     $q->execute();
                //     $numPages = ceil($q->rowCount() / $perPage);
                //     $data .= "<div style='width: 100%; margin: 0 10px; display: grid; grid-template-columns: auto auto; justify-content: space-between;'><span style='margin: 10px 0; font-size: 20px;'>Page $reqPage of $numPages</span><ul class='pagination pull-right'>";
                //     $prev = $viewingPage == 0 ? "disabled" : "";
                //     $prevPage = $reqPage == '' ? 1 : $reqPage-1;
                //     $data .= "<li class='pagination-item $prev' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$prevPage}, \"#pop_invoice_table\");'>&laquo;</li>";
                //     for($i=1; $i <= $numPages; $i++){  
                //         $active = $i == (($viewingPage / $perPage) + 1) ? 'active' : '';
                //         $data .= "<li class='pagination-item $active' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$(this).text()}, \"#pop_invoice_table\");'>$i</li>";
                //     }
                //     $next = $reqPage == $numPages ? "disabled" : "";
                //     $nextPage = $reqPage == '' ? 1 : $reqPage+1;
                //     $data .= "<li class='pagination-item $next' onclick='pop_rec(\"pop_invoice_table.php\", {perPage:$(\"#perPage\").val(), filter_column: $(\"#filter_column\").val(), search_term: $(\"#search_term\").val(), reqPage:$nextPage}, \"#pop_invoice_table\");'>&raquo;</li>";
                //     $data .= "</ul></div>";         
                // }
                // else{
                //     $data = "<div class='cl-12 cm-12 cs-12 cx-12 bg-danger'><h3 class='txt-danger txt-center'>No record found!</h3></div>";            
                // } 
            }       
        }
    } catch (PDOException $e) {
        $data = "Could not fetch records" . $e->getMessage();
    }

    echo $data;

?>
