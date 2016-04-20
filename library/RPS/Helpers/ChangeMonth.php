<?php

class RPS_Helpers_ChangeMonth
{

    public static function changeMonth ($day)
    {

        switch (date('n')) {
            case 1:
                $month = ($day < "31") ? "01" : "02";
                return $month;
                break;
            case 2:
                $month = ($day < "28") ? "02" : "03";
                return $month;
                break;
            case 3:
                $month = ($day < "31") ? "03" : "04";
                return $month;
                break;
            case 4:
                $month = ($day < "30") ? "04" : "05";
                return $month;
                break;
            case 5:
                $month = ($day < "31") ? "05" : "06";
                return $month;
                break;
            case 6:
                $month = ($day < "30") ? "06" : "07";
                return $month;
                break;
            case 7:
                $month = ($day < "31") ? "07" : "08";
                return $month;
                break;
            case 8:
                $month = ($day < "31") ? "08" : "09";
                return $month;
                break;
            case 9:
                $month = ($day < "30") ? "09" : "10";
                return $month;
                break;
            case 10:
                $month = ($day < "31") ? "10" : "11";
                return $month;
                break;
            case 11:
                $month = ($day < "30") ? "11" : "12";
                return $month;
                break;
            case 12:
                $month = ($day < "31") ? "12" : "01";
                return $month;
                break;
        }
    }
}