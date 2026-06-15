/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formateIndDate, formatMemberId } from '@/lib/helper';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 10,
    color: '#1e293b',
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 6,
    letterSpacing: 1,
    borderBottom: '1pt solid #000',
    paddingBottom: 4,
    width: '85%',
  },
  contactText: {
    fontSize: 8,
    color: '#475569',
    marginBottom: 2,
  },
  photoBox: {
    width: 85,
    height: 110,
    border: '1pt solid #000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  noPhotoText: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
  },
  contentWrapper: {
    flexGrow: 1,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
    marginTop: 10,
  },
  tRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  tRowLast: {
    flexDirection: 'row', 
  },
  tLabel: {
    width: '25%',
    padding: 8,
    backgroundColor: '#f1f5f9', 
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 9,
    color: '#334155',
    textTransform: 'uppercase',
  },
  tValue: {
    width: '25%',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 10,
    color: '#000000',
    fontWeight: 'bold',
  },
  tValueLast: {
    width: '25%',
    padding: 8,
    fontSize: 10,
    color: '#000000',
    fontWeight: 'bold',
  },
  tValueFull: {
    width: '75%',
    padding: 8,
    fontSize: 10,
    color: '#000000',
    fontWeight: 'bold',
  },
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 40,
    marginBottom: 20,
  },
  signatureLine: {
    width: 160,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 5,
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 9,
    color: '#000000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  signatureSubText: {
    fontSize: 8,
    color: '#475569',
    marginTop: 2,
  },
  annexureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    borderBottom: '1pt solid #000',
    paddingBottom: 5,
  },
  imagePageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    border: '1pt solid #cbd5e1',
    padding: 10,
  },
  documentImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
});

interface Student {
  id: string;
  memberId: number | null;
  name: string;
  gender: string;
  aadhaarNumber: string | null;
  phoneNumber: string;
  fatherName: string;
  fatherPhone: string;
  temporaryAddress: string | null;
  address: string | null;
  profileImageUrl: string | null;
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  createdAt: string;
}

interface StudentPDFProps {
  student: Student;
}

export const StudentPDF = ({ student }: StudentPDFProps) => {
  const maskAadhar = (aadhar: string | null) => {
    if (!aadhar) return 'N/A';
    return `XXXX - XXXX - ${aadhar.slice(-4)}`;
  };

  return (
    <Document>
      {/* PAGE 1: Formal Grid Record */}
      <Page size="A4" style={styles.page}>
        
        {/* Header Block */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Rk Library</Text>
            <Text style={styles.subtitle}>Registration Form</Text>
            
            <View style={{ marginTop: 4 }}>
              <Text style={styles.contactText}>Near OM palace, Harihar nagar, Mohaddiganj, Sasaram</Text>
              <Text style={styles.contactText}>Phone: +91 9334722085, +91 8340461404</Text>
              <Text style={styles.contactText}>Email: rklibrary01@gmail.com</Text>
            </View>

            <Text style={{ fontSize: 9, color: '#000', marginTop: 12, fontWeight: 'bold' }}>
              Admission Date: {formateIndDate(new Date(student.createdAt))}
            </Text>
          </View>
          
          <View style={styles.photoBox}>
            {student.profileImageUrl ? (
              <Image src={student.profileImageUrl} style={styles.photoImage} />
            ) : (
              <Text style={styles.noPhotoText}>Attach Photo</Text>
            )}
          </View>
        </View>

        {/* Content Wrapper to push signatures down */}
        <View style={styles.contentWrapper}>
          {/* Structured Table Grid */}
          <View style={styles.table}>
            
            {/* Row 1 */}
            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Full Name</Text>
              <Text style={styles.tValueFull}>{student.name}</Text>
            </View>
            
            {/* Row 2 */}
            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Member ID</Text>
              <Text style={styles.tValue}>{student.memberId ? formatMemberId(student.memberId) : 'PENDING'}</Text>
              <Text style={styles.tLabel}>Gender</Text>
              <Text style={styles.tValueLast}>{student.gender}</Text>
            </View>

            {/* Row 3 */}
            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Phone Number</Text>
              <Text style={styles.tValue}>{student.phoneNumber}</Text>
              <Text style={styles.tLabel}>Aadhaar No.</Text>
              <Text style={styles.tValueLast}>{maskAadhar(student.aadhaarNumber)}</Text>
            </View>

            {/* Row 4 */}
            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Father&apos;s Name</Text>
              <Text style={styles.tValueFull}>{student.fatherName}</Text>
            </View>

            {/* Row 5 */}
            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Father&apos;s Phone</Text>
              <Text style={styles.tValueFull}>{student.fatherPhone || 'N/A'}</Text>
            </View>

            {/* Row 6 */}
            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Local Address</Text>
              <Text style={styles.tValueFull}>{student.temporaryAddress || 'N/A'}</Text>
            </View>

            {/* Row 7 (Last Row) */}
            <View style={styles.tRowLast}>
              <Text style={styles.tLabel}>Perm. Address</Text>
              <Text style={styles.tValueFull}>{student.address || 'N/A'}</Text>
            </View>

          </View>
        </View>

        {/* Footer Signatures - Pushed to bottom */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>Applicant Signature</Text>
          </View>
          
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>Rajan Prakash</Text>
            <Text style={styles.signatureSubText}>Founder & Director</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 2: Aadhaar Front */}
      {student.aadhaarFrontUrl && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.annexureTitle}>Annexure: Identity Document (Front)</Text>
          <View style={styles.imagePageWrapper}>
            <Image src={student.aadhaarFrontUrl} style={styles.documentImage} />
          </View>
        </Page>
      )}

      {/* PAGE 3: Aadhaar Back */}
      {student.aadhaarBackUrl && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.annexureTitle}>Annexure: Identity Document (Back)</Text>
          <View style={styles.imagePageWrapper}>
            <Image src={student.aadhaarBackUrl} style={styles.documentImage} />
          </View>
        </Page>
      )}
    </Document>
  );
};