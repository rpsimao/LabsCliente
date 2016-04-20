<?php

/**
 * @abstract Master Class para connectar à Base de Dados do Backstage
 * 
 * @author Ricardo Simao
 * @version 1.0
 * @copyright Fernandes & Terceiro, S.A.
 * @package Embalagem Database
 * 
 * @abstract Ultima revisao - 14/08/2009
 */
class RPS_Config_DB_Backstage
{
    /**
     * @abstract Recupera os valores escritos no ficheiro de configuração da base de dados do Backstage
     * @return Zend_Config
     */
    function __construct ()
    {

        $config = Zend_Registry::get('backstage');
        $this->server = $config->database->params->host;
        $this->user = $config->database->params->username;
        $this->passwd = $config->database->params->password;
        $this->database = $config->database->params->dbname;
    }

   
}
?>