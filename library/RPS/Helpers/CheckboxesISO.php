<?php

class RPS_Helpers_CheckboxesISO
{

    /**
     * 
     * Transforma Sim ou N�o em 0 ou 1
     * @param string $value
     * @return int
     */
    public static function translateCheckboxes ($value)
    {

        $number = ($value == 'Sim') ? 1 : 0;
        return $number;
    }

    /**
     * Transforma 0 ou 1 Sim ou N�o
     * @param int $value
     * @return string
     */
    public static function reverseTranslateCheckboxes ($value)
    {

        $string = ($value == 0) ? 'N�o' : 'Sim';
        return $string;
    }
    
    
}
?>