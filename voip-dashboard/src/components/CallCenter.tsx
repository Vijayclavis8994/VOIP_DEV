"use client"

import { useState, useEffect, useMemo } from 'react'
import { 
  MagnifyingGlassIcon, 
  PhoneIcon,
  UserCircleIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  CheckIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { CallRecord, CallStats } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'
import { ActiveCallPanel } from './active-call/ActiveCallPanel'
import { IncomingCallToast } from './incoming/IncomingCallToast'
import { Modal } from './Modal'
import { CallModal } from './CallModal'
import { VoipSettings } from './VoipSettings'

type Props = {
  readonly stats: CallStats
  readonly query: string
  readonly setQuery: (q: string) => void
  readonly rows: CallRecord[]
}

export function CallCenter({ stats, query, setQuery, rows }: Props) {
  const [showActive, setShowActive] = useState(false) // Start closed
  const [showReceivePopup, setShowReceivePopup] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showMakeCallPopup, setShowMakeCallPopup] = useState(false)
  const [showMakeCallModal, setShowMakeCallModal] = useState(false)
  const [showTestButton, setShowTestButton] = useState(true)
  const [customerModalTab, setCustomerModalTab] = useState('customer-info')
  const [makeCallModalTab, setMakeCallModalTab] = useState('customer-info')
  const [selectedStatsTab, setSelectedStatsTab] = useState('total')
  
  // Modal states
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [showConversationModal, setShowConversationModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showTeamNotesModal, setShowTeamNotesModal] = useState(false)
  const [showParsedDataModal, setShowParsedDataModal] = useState(false)
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [callTimes, setCallTimes] = useState<Record<string, number>>({})

  // Generate call times only on client side to avoid hydration mismatch
  useEffect(() => {
    const times: Record<string, number> = {}
    rows.forEach((row) => {
      times[row.id] = Math.floor(Math.random() * 200) + 10
    })
    setCallTimes(times)
  }, [rows])

  // Filter data based on selected stats tab
  const filteredRows = useMemo(() => {
    let filteredData = rows
    
    // Filter by selected stats tab
    if (selectedStatsTab === 'completed') {
      filteredData = rows.filter((c) => c.status === 'completed')
    } else if (selectedStatsTab === 'missed') {
      filteredData = rows.filter((c) => c.status === 'missed')
    } else if (selectedStatsTab === 'voicemail') {
      filteredData = rows.filter((c) => c.hasVoicemail)
    } else if (selectedStatsTab === 'active') {
      filteredData = rows.filter((c) => c.status === 'active')
    }
    // 'total' shows all data
    
    return filteredData
  }, [rows, selectedStatsTab])

  // Function to handle making calls
  const handleMakeCall = (phoneNumber: string) => {
    // Create a mock call record for the modal
    const mockCall: CallRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      fromNumber: phoneNumber,
      contactName: 'New Call',
      hasVoicemail: false,
      direction: 'outbound',
      status: 'active'
    }
    setSelectedCall(mockCall)
    setShowCallModal(true)
    setShowMakeCallPopup(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto px-6 py-6">
          <div className="flex gap-2">
            {/* <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white shadow-lg' 
                  : 'border-2 border-success-500 text-figma-blue'
              }`}
            >
            </button> */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white shadow-lg' 
                  : 'border-2 border-success-500 text-figma-green'
              }`}
            >
              <PhoneIcon className="h-4 w-4" />
              <span
                className={`font-medium text-md ${
                  activeTab === 'dashboard'
                    ? 'text-white'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-success-500'
                }`}
              >
                Dashboard
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'settings' 
                  ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white shadow-lg' 
                  : 'border-2 border-success-500 text-figma-green'
              }`}
            >
              <UserCircleIcon className="h-4 w-4" />
              <span
                className={`font-medium text-md ${
                  activeTab === 'settings'
                    ? 'text-white'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-success-500'
                }`}
              >
                Settings
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'dashboard' && (
          <>
            {/* Stats, Search and Export in Same Row */}
            <div className="flex items-center gap-4 mb-6">
              {/* Stats Grid */}
              <div className="flex gap-3 flex-1">
                <button
                  onClick={() => setSelectedStatsTab('total')}
                  className={`flex flex-col items-start content-between text-left gap-3 p-3 w-28 rounded-lg border-2 transition-all duration-200 ${
                    selectedStatsTab === 'total'
                      ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white shadow-lg'
                      : 'border-figma-gray text-figma-gray'
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs font-medium">Total<br /> Calls</div>
                </button>
                <button
                  onClick={() => setSelectedStatsTab('completed')}
                  className={`flex flex-col items-start content-between text-left gap-3 p-3 w-28 rounded-lg border-2 transition-all duration-200 ${
                    selectedStatsTab === 'completed'
                      ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white shadow-lg'
                      : 'border-figma-gray text-figma-gray'
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-xs font-medium">Completed <br /> Calls</div>
                </button>
                <button
                  onClick={() => setSelectedStatsTab('missed')}
                  className={`flex flex-col items-start content-between text-left gap-3 p-3 w-28 rounded-lg border-2 transition-all duration-200 ${
                    selectedStatsTab === 'missed'
                      ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white shadow-lg'
                      : 'border-figma-gray text-figma-gray'
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.missed}</div>
                  <div className="text-xs font-medium">Missed<br /> Calls</div>
                </button>
                <button
                  onClick={() => setSelectedStatsTab('voicemail')}
                  className={`flex flex-col items-start content-between p-3 text-left gap-3 w-28 rounded-lg border-2 transition-all duration-200 ${
                    selectedStatsTab === 'voicemail'
                      ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white shadow-lg'
                      : 'border-figma-gray text-figma-gray'
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.voicemail}</div>
                  <div className="text-xs font-medium">Voicemail</div>
                </button>
                <button
                  onClick={() => setSelectedStatsTab('active')}
                  className={`flex flex-col items-start content-between p-3 text-left gap-3 w-28 rounded-lg border-2 transition-all duration-200 ${
                    selectedStatsTab === 'active'
                      ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white shadow-lg'
                      : 'border-figma-gray text-figma-gray'
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-xs font-medium">Active <br /> Call</div>
                </button>
        </div>

              {/* Search and Filter Bar */}
              <div className="flex items-center gap-4">
                <div className="form-control">
                  <div className="input-group relative">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search"
                      className="input input-bordered w-80 border-2 focus:outline-none focus:ring-0" style={{ borderColor: '#dbe4f0' }}
                    />
                    <button className="btn btn-square absolute right-0 bg-transparent border-0 z-10">
                      <MagnifyingGlassIcon className="h-5 w-5 text-figma-gray" />
                    </button>
                  </div>
                </div>
                <div className="form-control">
                  <div className="input-group flex">
                    <input
                      placeholder="Date range"
                      className="input input-bordered"
                    />
                    <button className="btn btn-square">
                      <CalendarIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <button className="flex items-center gap-2 me-2 p-3 h-auto rounded-md text-sm bg-gradient-to-r from-primary-500 to-success-500 text-white">
                  {/* <DocumentArrowDownIcon className="h-4 w-4" /> */}
                  Export CSV
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && <VoipSettings />}

        {/* Call Logs Table - Only show on Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="card bg-white shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-gray-50">
                <tr>
                    <Th><input type="checkbox" className="checkbox checkbox-sm" /></Th>
                  <Th>Date</Th>
                  <Th>From number</Th>
                  <Th>Contact name</Th>
                  <Th>Call transcript</Th>
                  <Th>Call recording</Th>
                  <Th>Summary</Th>
                  <Th>Direction</Th>
                    <Th>Team Notes</Th>
                    <Th>Call time</Th>
                    <Th>Call Status</Th>
                    <Th>Parsed Data</Th>
                </tr>
              </thead>
                <tbody>
                {filteredRows.map((row: CallRecord) => (
                    <tr key={row.id} className="hover">
                      <Td>
                        <input type="checkbox" className="checkbox checkbox-sm" />
                      </Td>
                      <Td>
                        <div className="text-xs w-40 font-medium text-gray-400">{formatDateTime(row.date)}</div>
                      </Td>
                      <Td>
                        <div className="font-mono w-28 text-sm text-gray-400">{row.fromNumber}</div>
                      </Td>
                      <Td>
                        <button 
                          onClick={() => {
                            setSelectedCall(row)
                            setShowAddCustomerModal(true)
                          }}
                          className="text-primary-600 text-sm flex items-center gap-1"
                        >
                          {row.contactName ? row.contactName : (
                            <>
                              <PlusIcon className="h-3 w-3" />
                              Add
                            </>
                          )}
                        </button>
                      </Td>
                      <Td>
                        <button 
                          onClick={() => {
                            setSelectedCall(row)
                            setShowConversationModal(true)
                          }}
                          className="text-primary-600 w-32 text-sm flex items-center gap-1"
                        >
                          <EyeIcon className="h-3 w-3" />
                          View Details
                        </button>
                      </Td>
                      <Td>
                        <button 
                          onClick={() => {
                            setSelectedCall(row)
                            setShowAudioModal(true)
                          }}
                          className="text-primary-600 text-sm flex items-center gap-1"
                        >
                          Listen
                          <SpeakerWaveIcon className="h-4 w-4" />
                        </button>
                      </Td>
                      <Td>
                        <button 
                          onClick={() => {
                            setSelectedCall(row)
                            setShowSummaryModal(true)
                          }}
                          className="text-primary-600 w-32 text-sm flex items-center gap-1"
                        >
                          <EyeIcon className="h-3 w-3" />
                          View Details
                        </button>
                    </Td>
                    <Td>
                        <span className="text-sm text-figma-dark capitalize">{row.direction}</span>
                    </Td>
                    <Td>
                        <button 
                          onClick={() => {
                            setSelectedCall(row)
                            setShowTeamNotesModal(true)
                          }}
                          className="text-primary-600 text-sm"
                        >
                          View Notes
                      </button>
                    </Td>
                    <Td>
                        <span className="text-sm text-figma-dark">{callTimes[row.id] || '--'}</span>
                      </Td>
                      <Td>
                        {(() => {
                          let statusColor = 'text-primary-600';
                          if (row.status === 'completed') {
                            statusColor = 'text-figma-green';
                          } else if (row.status === 'missed') {
                            statusColor = 'text-figma-red';
                          }
                          
                          let statusText = 'Voicemail';
                          if (row.status === 'completed') {
                            statusText = 'Completed';
                          } else if (row.status === 'missed') {
                            statusText = 'Missed';
                          }
                          
                          return (  
                            <span className={`text-sm font-bold capitalize ${statusColor}`}>
                              {statusText}
                            </span>
                          );
                        })()}
                      </Td>
                      <Td>
                        <button 
                          onClick={() => {
                            setSelectedCall(row)
                            setShowParsedDataModal(true)
                          }}
                          className="px-1 w-32 py-1 bg-blue-500 text-figma-white text-xs rounded-full"
                        >
                          View Parsed Data
                        </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Active Call Panel */}
        {showActive && (
          <ActiveCallPanel onClose={() => setShowActive(false)} />
        )}

        {/* Receive Popup */}
        {showReceivePopup && (
          <IncomingCallToast onClose={() => {
            setShowReceivePopup(false)
            setShowTestButton(true)
          }} />
        )}

        {/* Test Button for Incoming Call - Remove in production */}
        {showTestButton && (
          <button 
            onClick={() => {
              setShowReceivePopup(true)
              setShowTestButton(false)
            }}
            className="fixed bottom-6 left-6 px-4 py-2 bg-figma-green text-figma-white rounded-lg text-sm z-50"
          >
            Test Incoming Call
          </button>
        )}
    </main>

      {/* Floating Make a Call Button */}
      <button 
        onClick={() => setShowMakeCallModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-50"
      >
        <PhoneIcon className="h-8 w-8 text-figma-white" />
      </button>
      <div className="fixed bottom-1 right-6 text-xs text-figma-gray text-center">
        <div className='text-primary-500'>Make a call</div>
      </div>


      {/* Customer Information Modal */}
      <Modal
        isOpen={showMakeCallPopup}
        onClose={() => setShowMakeCallPopup(false)}
        title=""
        width="w-[500px]"
        position="center"
      >
        <div className="space-y-6">
          {/* Customer Name */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-figma-dark">John Doe</h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {/* Customer Information */}
            <div className={`relative rounded-t-lg ${customerModalTab === 'customer-info' ? '' : 'p-[2px] bg-gradient-to-r from-primary-500 to-success-500'}`}>
              <button 
                onClick={() => setCustomerModalTab('customer-info')}
                className={`flex items-center gap-1 px-4 py-2 font-medium text-md transition-colors rounded-lg w-full
                  ${customerModalTab === 'customer-info' 
                    ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white'
                    : 'bg-white text-figma-gray'
                  }`}
              >
                <UserCircleIcon className="h-4 w-4" />
                Customer Information
              </button>
            </div>

            {/* Call History */}
            <div className={`relative rounded-t-lg ${customerModalTab === 'call-history' ? '' : 'p-[2px] bg-gradient-to-r from-primary-500 to-success-500'}`}>
              <button 
                onClick={() => setCustomerModalTab('call-history')}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-md transition-colors rounded-lg w-full
                  ${customerModalTab === 'call-history' 
                    ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white'
                    : 'bg-white text-figma-gray'
                  }`}
              >
                <PhoneIcon className="h-4 w-4" />
                Call History
              </button>
            </div>

            {/* Job History */}
            <div className={`relative rounded-t-lg ${customerModalTab === 'job-history' ? '' : 'p-[2px] bg-gradient-to-r from-primary-500 to-success-500'}`}>
              <button 
                onClick={() => setCustomerModalTab('job-history')}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-md transition-colors rounded-lg w-full
                  ${customerModalTab === 'job-history' 
                    ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white'
                    : 'bg-white text-figma-gray'
                  }`}
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Job History
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {customerModalTab === 'customer-info' && (
            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-figma-gray mb-1">Phone</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-figma-dark">(123) 456 7890</span>
                    <span className="text-xs bg-figma-blueLight text-figma-blue px-2 py-1 rounded">Work</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-figma-dark">(123) 456 7890</span>
                    <span className="text-xs bg-figma-grayLight text-figma-gray px-2 py-1 rounded">Internal</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-figma-gray mb-1">Address</div>
                <div className="flex items-center gap-2">
                  <span className="text-figma-dark">123 Address st. City, Country 122345</span>
                  <span className="text-xs bg-figma-grayLight text-figma-gray px-2 py-1 rounded">Home</span>
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-figma-gray mb-1">Email</div>
                <span className="text-figma-dark">yourmail@mail.com</span>
              </div>

              <div>
                <div className="block text-sm font-medium text-figma-gray mb-1">Customer tags</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">sales</span>
                  <span className="px-3 py-1 bg-figma-blueLight text-figma-blue text-xs rounded-full">support</span>
                  <button className="w-6 h-6 bg-figma-grayLight text-figma-gray rounded-full flex items-center justify-center text-sm">+</button>
                  <button className="text-figma-blue text-sm">+ Add a tag</button>
                </div>
              </div>
            </div>
          )}

          {customerModalTab === 'call-history' && (
            <div className="space-y-4">
              <div className="text-center text-figma-gray mb-4">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Call History for John Doe</p>
              </div>
              
              <div className="space-y-3">
                {/* Call History Item 1 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneIcon className="h-4 w-4 text-figma-blue" />
                        <span className="font-medium text-figma-dark">Outbound Call</span>
                        <span className="text-xs bg-figma-green text-figma-white px-2 py-1 rounded">Completed</span>
                      </div>
                      <div className="text-sm text-figma-gray">Duration: 5m 32s</div>
                      <div className="text-sm text-figma-gray">Date: Dec 15, 2023 at 2:30 PM</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Call History Item 2 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneIcon className="h-4 w-4 text-figma-blue" />
                        <span className="font-medium text-figma-dark">Inbound Call</span>
                        <span className="text-xs bg-figma-gray text-figma-white px-2 py-1 rounded">Missed</span>
                      </div>
                      <div className="text-sm text-figma-gray">Duration: 0s</div>
                      <div className="text-sm text-figma-gray">Date: Dec 14, 2023 at 10:15 AM</div>
                      <div className="text-sm text-figma-blue mt-1">📞 Has Voicemail</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Call History Item 3 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneIcon className="h-4 w-4 text-figma-blue" />
                        <span className="font-medium text-figma-dark">Outbound Call</span>
                        <span className="text-xs bg-figma-green text-figma-white px-2 py-1 rounded">Completed</span>
                      </div>
                      <div className="text-sm text-figma-gray">Duration: 12m 45s</div>
                      <div className="text-sm text-figma-gray">Date: Dec 13, 2023 at 4:20 PM</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {customerModalTab === 'job-history' && (
            <div className="space-y-4">
              <div className="text-center text-figma-gray mb-4">
                <DocumentArrowDownIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Job History for John Doe</p>
              </div>
              
              <div className="space-y-3">
                {/* Job History Item 1 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-figma-dark">Service Call #SC-2023-001</span>
                        <span className="text-xs bg-figma-green text-figma-white px-2 py-1 rounded">Completed</span>
                      </div>
                      <div className="text-sm text-figma-gray mb-2">HVAC System Repair</div>
                      <div className="text-sm text-figma-gray">Date: Dec 10, 2023</div>
                      <div className="text-sm text-figma-gray">Technician: Mike Johnson</div>
                      <div className="text-sm text-figma-gray">Duration: 2h 30m</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job History Item 2 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-figma-dark">Installation #INST-2023-045</span>
                        <span className="text-xs bg-figma-blue text-figma-white px-2 py-1 rounded">In Progress</span>
                      </div>
                      <div className="text-sm text-figma-gray mb-2">New Water Heater Installation</div>
                      <div className="text-sm text-figma-gray">Date: Dec 18, 2023</div>
                      <div className="text-sm text-figma-gray">Technician: Sarah Wilson</div>
                      <div className="text-sm text-figma-gray">Estimated Duration: 4h</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job History Item 3 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-figma-dark">Maintenance #MAINT-2023-089</span>
                        <span className="text-xs bg-figma-gray text-figma-white px-2 py-1 rounded">Scheduled</span>
                      </div>
                      <div className="text-sm text-figma-gray mb-2">Quarterly HVAC Maintenance</div>
                      <div className="text-sm text-figma-gray">Date: Jan 5, 2024</div>
                      <div className="text-sm text-figma-gray">Technician: TBD</div>
                      <div className="text-sm text-figma-gray">Estimated Duration: 1h 30m</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call Action Buttons */}
          <div className="flex justify-end gap-4">
            {/* Call Modal Button */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => {
                  const mockCall: CallRecord = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    fromNumber: '+1 (555) 123-4567',
                    contactName: 'John Doe',
                    hasVoicemail: false,
                    direction: 'outbound',
                    status: 'active'
                  }
                  setSelectedCall(mockCall)
                  setShowCallModal(true)
                  setShowMakeCallPopup(false)
                }}
                className="w-16 h-16 bg-figma-green rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
              >
                <UserCircleIcon className="h-8 w-8 text-figma-white" />
              </button>
              <span className="text-xs text-figma-gray">Call Modal</span>
            </div>

            {/* View Customer Details Button */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => {
                  setShowMakeCallPopup(false)
                  setShowActive(true)
                }}
                className="w-16 h-16 bg-figma-green rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
              >
                <EyeIcon className="h-8 w-8 text-figma-white" />
              </button>
              <span className="text-xs text-figma-gray">View Details</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Make a Call Modal */}
      <Modal
        isOpen={showMakeCallModal}
        onClose={() => setShowMakeCallModal(false)}
        title=""
        width="w-[500px]"
        position="right"
      >
        <div className="space-y-6">
          {/* Customer Name */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-figma-dark">John Doe</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
  {/* Customer Information */}
  <div className={`relative rounded-lg ${makeCallModalTab === 'customer-info' ? '' : 'p-[2px] bg-gradient-to-r from-primary-500 to-success-500'}`}>
    <button 
      onClick={() => setMakeCallModalTab('customer-info')}
      className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors leading-tight rounded-lg w-36
        ${makeCallModalTab === 'customer-info' 
          ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white'
          : 'bg-white text-figma-gray'
        }`}
    >
      <UserCircleIcon className="h-7 w-7" />
      Customer<br/> Information
    </button>
  </div>

  {/* Call History */}
  <div className={`relative rounded-lg ${makeCallModalTab === 'call-history' ? '' : 'p-[2px] bg-gradient-to-r from-primary-500 to-success-500'}`}>
    <button 
      onClick={() => setMakeCallModalTab('call-history')}
      className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors leading-tight rounded-lg w-36
        ${makeCallModalTab === 'call-history' 
          ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white'
          : 'bg-white text-figma-gray'
        }`}
    >
      <PhoneIcon className="h-6 w-6" />
      Call<br/> History
    </button>
  </div>

  {/* Job History */}
  <div className={`relative rounded-lg ${makeCallModalTab === 'job-history' ? '' : 'p-[2px] bg-gradient-to-r from-primary-500 to-success-500'}`}>
    <button 
      onClick={() => setMakeCallModalTab('job-history')}
      className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors leading-tight rounded-lg w-36
        ${makeCallModalTab === 'job-history' 
          ? 'bg-gradient-to-r from-primary-500 to-success-500 text-figma-white'
          : 'bg-white text-figma-gray'
        }`}
    >
      <DocumentArrowDownIcon className="h-6 w-6" />
      Job <br/> History
    </button>
  </div>
</div>


          {/* Tab Content */}
          {makeCallModalTab === 'customer-info' && (
            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-figma-gray mb-1">Phone</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-figma-dark">(123) 456 7890</span>
                    <span className="text-xs bg-figma-blueLight text-figma-blue px-2 py-1 rounded">Work</span>
                    <button 
                      onClick={() => handleMakeCall('(123) 456 7890')}
                      className="ml-auto p-2 text-figma-blue rounded"
                    >
                      <PhoneIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-figma-dark">(123) 456 7890</span>
                    <span className="text-xs bg-figma-grayLight text-figma-gray px-2 py-1 rounded">Internal</span>
                    <button 
                      onClick={() => handleMakeCall('(123) 456 7890')}
                      className="ml-auto p-2 text-figma-blue rounded"
                    >
                      <PhoneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-figma-gray mb-1">Address</div>
                <div className="flex items-center gap-2">
                  <span className="text-figma-dark">123 Address st. City, Country 122345</span>
                  <span className="text-xs bg-figma-grayLight text-figma-gray px-2 py-1 rounded">Home</span>
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-figma-gray mb-1">Email</div>
                <span className="text-figma-dark">yourmail@mail.com</span>
              </div>

              <div>
                <div className="block text-sm font-medium text-figma-gray mb-1">Customer tags</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">sales</span>
                  <span className="px-3 py-1 bg-figma-blueLight text-figma-blue text-xs rounded-full">support</span>
                  <button className="w-6 h-6 bg-figma-grayLight text-figma-gray rounded-full flex items-center justify-center text-sm">+</button>
                  <button className="text-figma-blue text-sm">+ Add a tag</button>
                </div>
              </div>
            </div>
          )}

          {makeCallModalTab === 'call-history' && (
            <div className="space-y-4">
              <div className="text-center text-figma-gray mb-4">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Call History for John Doe</p>
              </div>
              
              <div className="space-y-3">
                {/* Call History Item 1 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneIcon className="h-4 w-4 text-figma-blue" />
                        <span className="font-medium text-figma-dark">Outbound Call</span>
                        <span className="text-xs bg-figma-green text-figma-white px-2 py-1 rounded">Completed</span>
                      </div>
                      <div className="text-sm text-figma-gray">Duration: 5m 32s</div>
                      <div className="text-sm text-figma-gray">Date: Dec 15, 2023 at 2:30 PM</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleMakeCall('+1 (555) 123-4567')}
                        className="p-2 text-figma-blue rounded"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Call History Item 2 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneIcon className="h-4 w-4 text-figma-blue" />
                        <span className="font-medium text-figma-dark">Inbound Call</span>
                        <span className="text-xs bg-figma-gray text-figma-white px-2 py-1 rounded">Missed</span>
                      </div>
                      <div className="text-sm text-figma-gray">Duration: 0s</div>
                      <div className="text-sm text-figma-gray">Date: Dec 14, 2023 at 10:15 AM</div>
                      <div className="text-sm text-figma-blue mt-1">📞 Has Voicemail</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleMakeCall('+1 (555) 987-6543')}
                        className="p-2 text-figma-blue rounded"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Call History Item 3 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneIcon className="h-4 w-4 text-figma-blue" />
                        <span className="font-medium text-figma-dark">Outbound Call</span>
                        <span className="text-xs bg-figma-green text-figma-white px-2 py-1 rounded">Completed</span>
                      </div>
                      <div className="text-sm text-figma-gray">Duration: 12m 45s</div>
                      <div className="text-sm text-figma-gray">Date: Dec 13, 2023 at 4:20 PM</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleMakeCall('+1 (555) 456-7890')}
                        className="p-2 text-figma-blue rounded"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {makeCallModalTab === 'job-history' && (
            <div className="space-y-4">
              <div className="text-center text-figma-gray mb-4">
                <DocumentArrowDownIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Job History for John Doe</p>
              </div>
              
              <div className="space-y-3">
                {/* Job History Item 1 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-figma-dark">Service Call #SC-2023-001</span>
                        <span className="text-xs bg-figma-green text-figma-white px-2 py-1 rounded">Completed</span>
                      </div>
                      <div className="text-sm text-figma-gray mb-2">HVAC System Repair</div>
                      <div className="text-sm text-figma-gray">Date: Dec 10, 2023</div>
                      <div className="text-sm text-figma-gray">Technician: Mike Johnson</div>
                      <div className="text-sm text-figma-gray">Duration: 2h 30m</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job History Item 2 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-figma-dark">Installation #INST-2023-045</span>
                        <span className="text-xs bg-figma-blue text-figma-white px-2 py-1 rounded">In Progress</span>
                      </div>
                      <div className="text-sm text-figma-gray mb-2">New Water Heater Installation</div>
                      <div className="text-sm text-figma-gray">Date: Dec 18, 2023</div>
                      <div className="text-sm text-figma-gray">Technician: Sarah Wilson</div>
                      <div className="text-sm text-figma-gray">Estimated Duration: 4h</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job History Item 3 */}
                <div className="border border-gray-200 rounded-lg p-4 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-figma-dark">Maintenance #MAINT-2023-089</span>
                        <span className="text-xs bg-figma-gray text-figma-white px-2 py-1 rounded">Scheduled</span>
                      </div>
                      <div className="text-sm text-figma-gray mb-2">Quarterly HVAC Maintenance</div>
                      <div className="text-sm text-figma-gray">Date: Jan 5, 2024</div>
                      <div className="text-sm text-figma-gray">Technician: TBD</div>
                      <div className="text-sm text-figma-gray">Estimated Duration: 1h 30m</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-figma-blue rounded">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-figma-gray rounded">
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call Action Buttons */}
          <div className="flex justify-end gap-4">
            {/* Call Modal Button */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => {
                  const mockCall: CallRecord = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    fromNumber: '+1 (555) 123-4567',
                    contactName: 'John Doe',
                    hasVoicemail: false,
                    direction: 'outbound',
                    status: 'active'
                  }
                  setSelectedCall(mockCall)
                  setShowCallModal(true)
                  setShowMakeCallModal(false)
                }}
                className="w-16 h-16 bg-figma-green rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
              >
                <UserCircleIcon className="h-8 w-8 text-figma-white" />
              </button>
              <span className="text-xs text-figma-gray">Call Modal</span>
            </div>

            {/* Close Button */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => setShowMakeCallModal(false)}
                className="w-16 h-16 bg-figma-gray rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
              >
                <CheckIcon className="h-8 w-8 text-figma-white" />
              </button>
              <span className="text-xs text-figma-gray">Close</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        title="Add Customer"
        showSaveButton={true}
        onSave={() => {
          // Here you would save the customer name
          setShowAddCustomerModal(false)
        }}
        saveButtonText="Save"
        width="w-96"
      >
        <div className="mb-4">
          <label htmlFor="customer-name" className="block text-sm font-medium text-figma-gray mb-2">Customer Name</label>
          <input
            id="customer-name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-figma-blue"
          />
        </div>
      </Modal>

      {/* Conversation Modal */}
      <Modal
        isOpen={showConversationModal}
        onClose={() => setShowConversationModal(false)}
        title={`Call Conversation - ${selectedCall?.fromNumber || 'Unknown'}`}
        width="w-4/5 max-w-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="m-0">Transcript Status</p>
            <select defaultValue="Customer contacted" className="select border-0 px-2 border-b focus:outline-none focus-within:outline-none rounded-none">
              <option disabled={true}>Customer contacted</option>
              <option>Changes Status</option>
              <option>Customer Contacted</option>
              <option>Contacted attempted - Left Message</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button className="px-3 py-3 text-xs bg-gradient-to-r from-primary-500 to-success-500 text-white rounded flex items-center justify-center shadow-lg transition-all duration-300">
              Push Data
            </button>
            <button className="px-3 py-3 text-xs bg-gradient-to-r from-primary-500 to-success-500 text-white rounded flex items-center justify-center shadow-lg transition-all duration-300">
              Translate in English 
            </button>
          </div>

          <div className="px-0 pt-0 pb-0 rounded-lg">
            <div className="text-figma-gray text-sm font-semibold mb-1">First message changes,</div>
            <div className="text-figma-gray text-sm">Thank you for calling.</div>
          </div>
          <div className="px-0 pt-0 pb-0 rounded-lg">
            <div className="text-figma-gray text-sm font-semibold mb-1">You're welcome. How can I assist you with your heating or cooling needs today?</div>
            <div className="text-figma-gray text-sm">Thank you for calling. We are currently unable to take your call at this time. Please leave your name, phone number, and a brief message. 1 of our representatives will contact you at our earliest convenience.</div>
          </div>
          <div className="px-0 pt-0 pb-2 rounded-lg">
            <div className="font-semibold text-figma-gray text-sm">You for reaching out to Sujit Clavis. Please leave your name, phone number, and a brief message. And 1 of our representatives will get back to you as soon as possible.</div>
          </div>
          {/* <div className="bg-figma-grayLight p-4 rounded-lg">
            <div className="font-semibold text-figma-gray mb-2">Human:</div>
            <div className="text-figma-dark">Thank you, that would be great. I appreciate your help.</div>
          </div> */}
          <div className="flex items-center justify-between gap-2">
              <button className="px-3 py-3 text-xs text-white bg-figma-red rounded flex items-center justify-center shadow-lg transition-all duration-300">
                Report This Chat/Voice For Training 
              </button>
              <button className="px-3 py-3 text-xs text-white bg-figma-blue rounded flex items-center justify-center shadow-lg transition-all duration-300">
                Report This Chat/Voice For Training 
              </button>
            </div>
        </div>
      </Modal>
      {/* Summary Modal */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="Summary"
        width="w-4/5 max-w-4xl"
      >
        <div className="space-y-4">
          <div className="bg-figma-grayLight p-4 rounded-lg">
            <div className="font-semibold text-figma-gray mb-2">Summary</div>
            <div className="text-figma-dark">Customer was very cooperative and understanding about the billing issue.</div>
          </div>
        </div>
      </Modal>
      {/* Team Notes Modal */}
      <Modal
        isOpen={showTeamNotesModal}
        onClose={() => setShowTeamNotesModal(false)}
        title="Team Notes"
        showSaveButton={true}
        onSave={() => setShowTeamNotesModal(false)}
        saveButtonText="Add Note"
        width="w-96"
      >
        <div className="space-y-4">
          <div className="bg-figma-grayLight p-2 rounded-lg">
            <div className="text-sm text-figma-gray mb-1">John Doe - 2 hours ago</div>
            <div className="text-figma-dark text-sm">Customer was very cooperative and understanding about the billing issue.</div>
          </div>
          <div className="bg-figma-grayLight p-2 rounded-lg">
            <div className="text-sm text-figma-gray mb-1">Sarah Smith - 1 hour ago</div>
            <div className="text-figma-dark text-sm">Issue resolved successfully. Customer was satisfied with the solution.</div>
          </div>
          <div className="mb-4">
            <label htmlFor="new-note" className="block text-sm font-medium text-figma-gray mb-2">Add New Note</label>
            <textarea
              id="new-note"
              rows={3}
              placeholder="Enter your note here..."
              className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-figma-blue"
            />
          </div>
        </div>
      </Modal>

      {/* Parsed Data Modal */}
      <Modal
        isOpen={showParsedDataModal}
        onClose={() => setShowParsedDataModal(false)}
        title="Parsed Data"
        width="w-4/5 max-w-2xl"
      >
        <button className="px-4 py-3 mb-4 text-xs bg-gradient-to-r from-primary-500 to-success-500 text-white rounded flex items-center justify-center shadow-lg transition-all duration-300">
          Push Data
        </button>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">First Name</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Last Name</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Email Address</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Contact Number</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Job Type</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">priority</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Full address</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Google fully verified address</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Address line 1</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Address line 2</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">City</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">State</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Zip code</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">Country</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">transcript_link</td>
                <td className="border border-gray-300 px-4 py-2 text-figma-gray text-sm">http://nowl.ink/4c118730a7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Audio Player Modal */}
      <Modal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        title="Audio Recording"
        width="w-96"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <SpeakerWaveIcon className="h-10 w-10 text-figma-white" />
            </div>
            <h3 className="text-lg font-semibold text-figma-dark mb-2">
              Call Recording - {selectedCall?.fromNumber || 'Unknown'}
            </h3>
            <p className="text-sm text-figma-gray">
              {selectedCall?.contactName || 'Unknown Contact'}
            </p>
          </div>

          {/* Audio Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="w-full bg-figma-grayLight rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-sm text-figma-gray">
              <span>1:23</span>
              <span>3:45</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
                    <button className="p-2 text-figma-gray">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zM6.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-figma-blue rounded-full flex items-center justify-center text-figma-white transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>
              
                    <button className="p-2 text-figma-gray">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zM14.293 4.293a1 1 0 00-1.414 0l-5 5a1 1 0 000 1.414l5 5a1 1 0 001.414-1.414L11.414 10l4.293-4.293a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-figma-gray">Volume</span>
                <span className="text-sm text-figma-gray">75%</span>
              </div>
              <div className="w-full bg-figma-grayLight rounded-full h-2">
                <div className="bg-figma-green h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Call Modal */}
      <CallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        callRecord={selectedCall}
        onMakeCall={handleMakeCall}
      />
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  color = 'default',
  size = 'normal'
}: { 
  readonly label: string
  readonly value: number
  readonly color?: 'blue' | 'green' | 'default'
  readonly size?: 'small' | 'normal'
}) {
  const isActive = color === 'green'
  const isBlue = color === 'blue'
  const isSmall = size === 'small'
  
  const cardBgClass = isActive ? 'bg-figma-green' : 'border-gray-200'
  
  let valueColorClass = 'text-figma-dark';
  if (isBlue) {
    valueColorClass = 'text-figma-blue';
  } else if (isActive) {
    valueColorClass = 'text-figma-white';
  }
  
  const labelColorClass = isActive ? 'text-figma-white' : 'text-figma-gray'
  
  const cardClasses = isSmall 
    ? `bg-figma-white rounded-lg p-2 shadow-soft border ${cardBgClass} min-h-[120px] w-24 flex flex-col justify-center`
    : `bg-figma-white rounded-lg p-3 shadow-soft border ${cardBgClass} min-h-[100px] flex flex-col justify-center input-success`
  
  const valueClasses = isSmall 
    ? `text-3xl font-bold mb-1 ${valueColorClass}`
    : `text-3xl font-bold mb-2 ${valueColorClass}`
  
  const labelClasses = isSmall 
    ? `text-xs ${labelColorClass} text-center`
    : `text-xs ${labelColorClass}`
  
  return (
    <div className={cardClasses}>
      <div className={valueClasses}>
        {value}
      </div>
      <div className={labelClasses}>
        {label}
      </div>
    </div>
  )
}

function Th({ children }: { readonly children: React.ReactNode }) {
  return <th className="text-left px-6 py-4 font-semibold text-figma-gray text-sm">{children}</th>
}

function Td({ children, className }: { readonly children: React.ReactNode; readonly className?: string }) {
  return <td className={`px-6 py-4 ${className ?? ''}`}>{children}</td>
}