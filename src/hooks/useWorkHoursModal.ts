
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useUser } from "@/contexts/UserContext";

export const useWorkHoursModal = (isOpen: boolean) => {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState('');
  const [isWorkInProgress, setIsWorkInProgress] = useState(false);
  const [savedStartDateTime, setSavedStartDateTime] = useState<Date | null>(null);
  const { addWorkHours } = useUser();

  useEffect(() => {
    // Check if there's a work session in progress
    const savedStart = localStorage.getItem('workStartDateTime');
    if (savedStart) {
      const startDateTime = new Date(savedStart);
      setSavedStartDateTime(startDateTime);
      setIsWorkInProgress(true);
      setStartDate(format(startDateTime, 'yyyy-MM-dd'));
      setStartTime(format(startDateTime, 'HH:mm'));
    }
  }, [isOpen]);

  const handleStartWork = () => {
    if (!startDate || !startTime) {
      alert('Por favor, preencha a data e hora de início');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    localStorage.setItem('workStartDateTime', startDateTime.toISOString());
    setSavedStartDateTime(startDateTime);
    setIsWorkInProgress(true);
  };

  const handleEndWork = () => {
    if (!savedStartDateTime) {
      alert('Não há jornada de trabalho iniciada');
      return;
    }

    if (!endDate || !endTime) {
      alert('Por favor, preencha a data e hora de fim');
      return;
    }

    const endDateTime = new Date(`${endDate}T${endTime}:00`);
    
    if (endDateTime <= savedStartDateTime) {
      alert('A data/hora de fim deve ser posterior à data/hora de início');
      return;
    }

    addWorkHours({
      startDateTime: savedStartDateTime,
      endDateTime
    });

    // Clear saved work session
    localStorage.removeItem('workStartDateTime');
    setSavedStartDateTime(null);
    setIsWorkInProgress(false);
    setStartTime('');
    setEndTime('');
    return true; // Indicates success
  };

  const handleCancelWork = () => {
    localStorage.removeItem('workStartDateTime');
    setSavedStartDateTime(null);
    setIsWorkInProgress(false);
    setStartTime('');
    setEndTime('');
  };

  return {
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    isWorkInProgress,
    savedStartDateTime,
    handleStartWork,
    handleEndWork,
    handleCancelWork
  };
};
