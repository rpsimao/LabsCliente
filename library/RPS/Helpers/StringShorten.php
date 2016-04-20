<?php
/** 
 * @author rpsimao
 * 
 * 
 */
class RPS_Helpers_StringShorten
{

    public static function text($text, $char)
    {
        $text = substr($text, 0, $char); //First chop the string to the given character length
        if (substr($text, 0, strrpos($text, ' ')) != '')
            $text = substr($text, 0, strrpos($text, ' ')); //If there exists any space just before the end of the chopped string take upto that portion only.
        //In this way we remove any incomplete word from the paragraph
        $text = $text . '...'; //Add continuation ... sign
        
        return $text; //Return the value
    }
}
?>