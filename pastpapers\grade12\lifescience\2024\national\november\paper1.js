// Grade 12 Life Science Past Papers

// Simple function name - just generatePaper()
function generatePaper() {
    return `
        <section class="note-section">
            <p class="lead-text">Grade 12 Life Science - 2024 November Examination - Paper 1</p>
            <div class="exam-info">
                <strong>Time:</strong> 2½ hours &nbsp;&nbsp; <strong>Marks:</strong> 150
            </div>
        </section>

        <section class="note-section question-section">
            <h2>SECTION A</h2>
            <h3>QUESTION 1</h3>
            
            <div class="sub-question">
                <h3>1.1 Multiple Choice Questions</h3>
                
                <div class="sub-question">
                    <h4>1.1.1</h4>
                    <p>The hormone responsible for the regulation of salt content in the human body is …</p>
                    <p><strong>A.</strong> testosterone.<br>
                    <strong>B.</strong> aldosterone.<br>
                    <strong>C.</strong> prolactin.<br>
                    <strong>D.</strong> glucagon.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q1-1-1')">Reveal Answer</button>
                    <div class="answer-box" id="q1-1-1" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• <strong>B.</strong> aldosterone <span class="mark">✓✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q1-1-1')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q1-1-1" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Aldosterone is produced by the adrenal cortex and is the key hormone in salt regulation. It acts on the kidneys to increase sodium reabsorption, which in turn affects water retention and blood pressure.
                        </div>
                    </div>
                </div>

                <div class="sub-question">
                    <h4>1.1.2</h4>
                    <p>The structure that connects two neurons is called a …</p>
                    <p><strong>A.</strong> dendrite.<br>
                    <strong>B.</strong> synapse.<br>
                    <strong>C.</strong> axon.<br>
                    <strong>D.</strong> myelin.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q1-1-2')">Reveal Answer</button>
                    <div class="answer-box" id="q1-1-2" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• <strong>B.</strong> synapse <span class="mark">✓✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q1-1-2')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q1-1-2" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> A synapse is the gap between two neurons where chemical signals are transmitted.
                        </div>
                    </div>
                </div>

                <div class="sub-question">
                    <h4>1.1.3</h4>
                    <p>Meiosis produces …</p>
                    <p><strong>A.</strong> 2 diploid cells.<br>
                    <strong>B.</strong> 2 haploid cells.<br>
                    <strong>C.</strong> 4 diploid cells.<br>
                    <strong>D.</strong> 4 haploid cells.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q1-1-3')">Reveal Answer</button>
                    <div class="answer-box" id="q1-1-3" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• <strong>D.</strong> 4 haploid cells <span class="mark">✓✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q1-1-3')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q1-1-3" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Meiosis reduces chromosome number by half, producing four haploid gametes.
                        </div>
                    </div>
                </div>
            </div>

            <div class="sub-question">
                <h3>1.2 Matching Questions</h3>
                
                <div class="sub-question">
                    <h4>1.2.1</h4>
                    <p>Match: The organelle that synthesizes proteins</p>
                    <button class="reveal-btn" onclick="revealAnswer('q1-2-1')">Reveal Answer</button>
                    <div class="answer-box" id="q1-2-1" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• Ribosome <span class="mark">✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q1-2-1')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q1-2-1" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Ribosomes are the sites of protein synthesis in cells.
                        </div>
                    </div>
                </div>

                <div class="sub-question">
                    <h4>1.2.2</h4>
                    <p>Match: The process by which plants make food</p>
                    <button class="reveal-btn" onclick="revealAnswer('q1-2-2')">Reveal Answer</button>
                    <div class="answer-box" id="q1-2-2" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• Photosynthesis <span class="mark">✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q1-2-2')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q1-2-2" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Photosynthesis converts light energy into chemical energy (glucose).
                        </div>
                    </div>
                </div>
            </div>

            <div class="sub-question">
                <h3>1.3 True/False</h3>
                
                <div class="sub-question">
                    <h4>1.3.1</h4>
                    <p>DNA replication is semi-conservative.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q1-3-1')">Reveal Answer</button>
                    <div class="answer-box" id="q1-3-1" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• True <span class="mark">✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q1-3-1')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q1-3-1" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Each new DNA molecule contains one original strand and one new strand.
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="note-section question-section">
            <h2>SECTION B</h2>
            <h3>QUESTION 2</h3>
            
            <div class="sub-question">
                <h3>2.1 Short Questions</h3>
                
                <div class="sub-question">
                    <h4>2.1.1</h4>
                    <p>Name the stage of mitosis where chromosomes line up at the equator.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q2-1-1')">Reveal Answer</button>
                    <div class="answer-box" id="q2-1-1" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• Metaphase <span class="mark">✓✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q2-1-1')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q2-1-1" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> During metaphase, chromosomes align at the cell's equator before separation.
                        </div>
                    </div>
                </div>

                <div class="sub-question">
                    <h4>2.1.2</h4>
                    <p>State TWO functions of the liver.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q2-1-2')">Reveal Answer</button>
                    <div class="answer-box" id="q2-1-2" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• Detoxification <span class="mark">✓</span></div>
                        <div class="mark-point">• Produces bile <span class="mark">✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q2-1-2')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q2-1-2" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> The liver detoxifies blood and produces bile for fat digestion.
                        </div>
                    </div>
                </div>

                <div class="sub-question">
                    <h4>2.1.3</h4>
                    <p>Define homeostasis.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q2-1-3')">Reveal Answer</button>
                    <div class="answer-box" id="q2-1-3" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• Maintenance of a constant internal environment <span class="mark">✓✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q2-1-3')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q2-1-3" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Homeostasis keeps body conditions stable despite external changes.
                        </div>
                    </div>
                </div>
            </div>

            <div class="sub-question">
                <h3>2.2 Application Questions</h3>
                
                <div class="sub-question">
                    <h4>2.2.1</h4>
                    <p>Calculate the magnification if the image size is 50mm and actual size is 0.5mm.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q2-2-1')">Reveal Answer</button>
                    <div class="answer-box" id="q2-2-1" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• Magnification = 50 ÷ 0.5 = 100× <span class="mark">✓✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q2-2-1')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q2-2-1" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Magnification = Image size ÷ Actual size.
                        </div>
                    </div>
                </div>

                <div class="sub-question">
                    <h4>2.2.2</h4>
                    <p>Explain why oxygen debt occurs after exercise.</p>
                    <button class="reveal-btn" onclick="revealAnswer('q2-2-2')">Reveal Answer</button>
                    <div class="answer-box" id="q2-2-2" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• Lactic acid must be broken down <span class="mark">✓</span></div>
                        <div class="mark-point">• Requires extra oxygen <span class="mark">✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q2-2-2')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q2-2-2" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Oxygen debt repays the oxygen needed to convert lactic acid back to glucose.
                        </div>
                    </div>
                </div>
            </div>

            <div class="sub-question">
                <h3>2.3 Essay Question</h3>
                
                <div class="sub-question">
                    <h4>2.3.1</h4>
                    <p>Describe the process of protein synthesis. (8 marks)</p>
                    <button class="reveal-btn" onclick="revealAnswer('q2-3-1')">Reveal Answer</button>
                    <div class="answer-box" id="q2-3-1" style="display: none;">
                        <h4>ANSWER:</h4>
                        <div class="mark-point">• Transcription in nucleus <span class="mark">✓</span></div>
                        <div class="mark-point">• DNA unwinds <span class="mark">✓</span></div>
                        <div class="mark-point">• mRNA copies code <span class="mark">✓</span></div>
                        <div class="mark-point">• mRNA moves to ribosome <span class="mark">✓</span></div>
                        <div class="mark-point">• Translation occurs <span class="mark">✓</span></div>
                        <div class="mark-point">• tRNA brings amino acids <span class="mark">✓</span></div>
                        <div class="mark-point">• Peptide bonds form <span class="mark">✓</span></div>
                        <div class="mark-point">• Protein chain created <span class="mark">✓</span></div>
                    </div>
                    
                    <button class="paperbrain-boost-btn" onclick="usePaperbrainBoost('q2-3-1')">
                        <img src="/brain-icon.svg" width="20" height="20" alt="Brain" style="vertical-align: middle; margin-right: 6px;">
                        BOOST
                    </button>
                    
                    <div class="paperbrain-boost-box" id="boost-q2-3-1" style="display: none;">
                        <div class="boost-content">
                            <strong>PaperBrain Explanation:</strong> Protein synthesis has two main stages: transcription (DNA to mRNA) and translation (mRNA to protein).
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="exam-footer">
            <p>END OF PAPER 1</p>
            <p>Total: 150 marks</p>
        </section>
    `;
}

console.log('✅ Grade 12 Life Science past papers loaded');
