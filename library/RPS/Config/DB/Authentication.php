<?php

/**
 * Master Class para connectar à Base de Dados Authentication
 * 
 * @author Ricardo Simao
 * @version 1.0
 * @copyright Fernandes & Terceiro, S.A.
 * @package Embalagem Database
 * 
 * @abstract Ultima revisao - 10/03/2010
 */
class RPS_Config_DB_Authentication
{
    
    /**
     * @abstract Recupera os valores de acesso à base de dados Embalagem que estão escritos no ficheiro de configurção
     * @abstract Inicializa a conexão
     * @return Zend_Db_Table_Abstract
     */
    function __construct ()
    {
        $config = Zend_Registry::get('authentication');
        $db = Zend_Db::factory($config->database);
        Zend_Db_Table_Abstract::setDefaultAdapter($db);
    }
}
?>