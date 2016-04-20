<?php
class IndexController extends Zend_Controller_Action
{



    public function preDispatch()
    {
        $this->_helper->layout()->setLayout('main-login-2.0');
        $this->_helper->viewRenderer('login');
        $this->form = new Application_Form_Login();
    }

    public function indexAction()
    {
        $this->view->form = $this->form;
    }
}

