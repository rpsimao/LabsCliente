<?php

class RPS_Helpers_JobState
{

    protected static $job;

    public static function getState ($job)
    {

        $db = new RPS_UserService_Optimus();
        $sql = $db->getStateOfJob($job);
        return $sql['tm_act'];
    }

    private function transform ($machineState)
    {

        if ($machineState == "006 IMPRIM") {
            $humanState = "ACAB";
            return $humanState;
        } else {
            return $machineState;
        }
    }
}
