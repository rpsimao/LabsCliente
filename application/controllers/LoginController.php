<?php

class LoginController extends Zend_Controller_Action {
	
	public function init() {
		$this->form = new Application_Form_Login ();
		$this->model = new RPS_UserService_Clients ();
		
		
		
	}
	
	public function indexAction() {
		$this->_helper->layout()->setLayout('main-login-2.0');
        $this->_helper->viewRenderer('login');
		if ($this->form->isValid ( $this->_request->getPost () )) {
			
			if ($this->model->authenticate ( $this->form->getValues () )) {
			    
			    
				
			
			} else {
				
				$this->view->form = $this->form;
			}
		} else {
			//passa as mensagem de erro e o formulário para a VIEW
			$this->view->errors = $this->form->getMessages ();
			$this->view->form = $this->form;
		
		}
	}

}

