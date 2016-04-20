<?php

class NoauthController extends Zend_Controller_Action
{

    public function init()
    {
        $this->_helper->layout()->setLayout('main-iso-2.0');
        $this->_helper->viewRenderer('noauth');
    }

    public function indexAction()
    {
        // action body
    }


}

