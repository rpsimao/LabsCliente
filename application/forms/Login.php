<?php

class Application_Form_Login extends Zend_Form {
	
	
	/**
     * Define os erros para apresentar ao utilizadores
     *
     */
    const ERR_EMPTY_FIELD = '*Este campo não pode estar vazio.';
    const ERR_LENGHT_PASSWD = '*A palavra passe tem de ter entre 4 e 12 caracteres.';
    const ERR_COD_F3 = '*Este campo tem de ter 5 algarismos.';
    const ERR_EMAIL_MALFORMED = '* Oendereço de email não é válido';
    const ERR_ONLY_NUMBERS_ALLOWED = "*Este campo só pode conter algarismos.";
    const ERR_ILLEGAL_CHARS = "*Este campo só pode conter caracteres alfanuméricos";
	
	public function init()
    {
        $this->setMethod('post');
        $this->setAction('/login');
        $this->setAttrib('id', 'form-login');
        
        
        $username = new Zend_Form_Element_Text('username');
        $username->setLabel('Nome:*')
        		 ->setRequired(true)
        		 ->addValidators(array(new Zend_Validate_Alnum()))
        		 ->setErrorMessages(array(self::ERR_EMPTY_FIELD, self::ERR_ILLEGAL_CHARS));

        $password = new Zend_Form_Element_Password('password');
        $password->setLabel('Password:*')
              	 ->setRequired(true)
              	 ->addValidators(array(new Zend_Validate_Alnum()))
        		 ->setErrorMessages(array(self::ERR_EMPTY_FIELD, self::ERR_ILLEGAL_CHARS))
                 ->setAttrib('onfocus', 'pass()');

        $submit = new Zend_Form_Element_Submit('submit');
        $submit->setLabel('Entrar');
        $submit->setAttrib('class', "button");
        
               
        $this->addElements(array($username,$password,$submit));

        $this->setElementDecorators(array(
            'ViewHelper', 'Errors',
            array(array('data' => 'HtmlTag'),  array('tag' =>'td', 'class'=> 'element')),
            array('Label', array('tag' => 'td')),
            array(array('row' => 'HtmlTag'), array('tag' => 'tr'))
        ));
        $submit->setDecorators(array('ViewHelper',
            array(array('data' => 'HtmlTag'),  array('tag' =>'td', 'class'=> 'element')),
            array(array('emptyrow' => 'HtmlTag'),  array('tag' =>'td', 'class'=> 'element', 'placement' => 'PREPEND')),
            array(array('row' => 'HtmlTag'), array('tag' => 'tr'))
            ));
        
        $this->setDecorators(array(
            'FormElements',
            array('HtmlTag', array('tag' => 'table', 'class'=>'login-table')),
            'Form'
        ));



    }
}



