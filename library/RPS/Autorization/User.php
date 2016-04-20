<?php

class RPS_Autorization_User {
	
	const USER_AUTH = 1;
	const USER_DENY = 0;
	
	protected $username;
	
	public function setUsername($username) {
		$this->username = $username;
	}
	
	public function getUsername() {
		return $this->username;
	}
	
	public function check() {
		
		$userLogged = Zend_Auth::getInstance ()->getIdentity ();
				
		if ($userLogged->username != $this->username) {
			return self::USER_DENY;
		} else {
			return self::USER_AUTH;
		}
	
	}
}

?>