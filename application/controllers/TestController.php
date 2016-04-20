<?php

class TestController extends Zend_Controller_Action
{

    public function init ()
    {
    /* Initialize action controller here */
    }

    public function indexAction ()
    {
        $this->_helper->layout()->setLayout('main-iso-2.0');
        
    }
}

