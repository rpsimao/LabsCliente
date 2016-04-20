<?php
class RPS_Helpers_DefineControllerName
{

    private static function getAuthUser ()
    {

        $authUser = Zend_Auth::getInstance()->getIdentity();
        return $authUser->username;
    }

    private static function matchLabs ()
    {

        $lab = new RPS_UserService_Match();
        $lab->setUsername(self::getAuthUser());
        $labName = $lab->labName();
        return $labName['lab'];
    }

    public static function controllerName ()
    {

        return self::matchLabs();
    }
}
?>