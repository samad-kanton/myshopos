<?php

  function addOrdinalNumberSuffix($num) {
    if (!in_array(($num % 100), array(11,12,13))){
      switch ($num % 10) {
        // Handle 1st, 2nd, 3rd
        case 1:  return $num.'<sup>st</sup>';
        case 2:  return $num.'<sup>nd</sup>';
        case 3:  return $num.'<sup>rd</sup>';
      }
    }
    return $num.'<sup>th</sup>';
  }

?>