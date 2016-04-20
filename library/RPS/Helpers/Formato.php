<?php

class RPS_Helpers_Formato
{

    /**
     * Trocar os * por x no formato do trabalho
     * @param data $string
     * @return string
     */
    public static function replaceAst ($data)
    {

        $find = "*";
        $replace = "x";
        $final = str_replace($find, $replace, $data);
        return $final;
    }
}
?>