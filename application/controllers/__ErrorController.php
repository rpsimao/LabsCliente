<?php

/**
 * 
 * Default error controller
 *
 */
class ErrorController extends Zend_Controller_Action
{

    public function errorAction()
    {
        $errors = $this->_getParam('error_handler');
        $this->_helper->layout()->setLayout('main-iso-2.0');
        
        
        switch ($errors->type) { 
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_CONTROLLER:
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ACTION:
        
                // 404 error -- controller or action not found
                $this->getResponse()->setHttpResponseCode(404);
                $this->view->message = $this->displayErrorInProduction();
                break;
            default:
                // application error 
                $this->getResponse()->setHttpResponseCode(500);
                $this->view->message = 'Application error';
                break;
        }
        
        $this->view->exception = $errors->exception;
        $this->view->request   = $errors->request;
    }
    
    
    private function displayErrorInProduction()
    {
        
        
        $http = '<div id="oops">';
        $http.= '<h2>Oops, ocorreu um erro!</h2>';
        $http.= '<p>A p&aacute;gina que pretende n&atilde;o existe ou foi alterada.</p>';
        
        return $http;
        
        
        
    }


}

