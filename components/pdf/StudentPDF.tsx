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
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
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
    width: '90%',
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
    objectFit: 'cover',
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
    marginTop: 5,
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
    padding: 6,
    backgroundColor: '#f1f5f9', 
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 8,
    color: '#334155',
    textTransform: 'uppercase',
  },
  tValue: {
    width: '25%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontSize: 9,
    color: '#000000',
    fontWeight: 'bold',
  },
  tValueLast: {
    width: '25%',
    padding: 6,
    fontSize: 9,
    color: '#000000',
    fontWeight: 'bold',
  },
  tValueFull: {
    width: '75%',
    padding: 6,
    fontSize: 9,
    color: '#000000',
    fontWeight: 'bold',
  },
  idSectionWrapper: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15, 
    height: 180,
  },
  idCardBox: {
    flex: 1,
    border: '1pt dashed #94a3b8',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  idCardLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 5,
    borderBottom: '1pt solid #cbd5e1',
    width: '100%',
    textAlign: 'center',
    paddingBottom: 3,
  },
  idImage: {
    width: '100%',
    flex: 1,
    objectFit: 'contain',
  },
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 25,
    marginBottom: 10,
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
  documentImageLarge: {
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
  mode: 'single' | 'multiple';
}

export const StudentPDF = ({ student, mode }: StudentPDFProps) => {

  const maskAadhar = (aadhar: string | null) => {
    if (!aadhar) return 'N/A';
    return `XXXX - XXXX - ${aadhar.slice(-4)}`;
  };

  return (
    <Document>
      {/* PAGE 1: Formal Record */}
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

        <View style={styles.contentWrapper}>
          {/* Structured Table Grid */}
          <View style={styles.table}>
            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Full Name</Text>
              <Text style={styles.tValueFull}>{student.name}</Text>
            </View>
            
            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Member ID</Text>
              <Text style={styles.tValue}>{student.memberId ? formatMemberId(student.memberId) : 'PENDING'}</Text>
              <Text style={styles.tLabel}>Gender</Text>
              <Text style={styles.tValueLast}>{student.gender}</Text>
            </View>

            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Phone Number</Text>
              <Text style={styles.tValue}>{student.phoneNumber}</Text>
              <Text style={styles.tLabel}>Aadhaar No.</Text>
              <Text style={styles.tValueLast}>{maskAadhar(student.aadhaarNumber)}</Text>
            </View>

            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Father&apos;s Name</Text>
              <Text style={styles.tValueFull}>{student.fatherName}</Text>
            </View>

            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Father&apos;s Phone</Text>
              <Text style={styles.tValueFull}>{student.fatherPhone || 'N/A'}</Text>
            </View>

            <View style={styles.tRow}>
              <Text style={styles.tLabel}>Local Address</Text>
              <Text style={styles.tValueFull}>{student.temporaryAddress || 'N/A'}</Text>
            </View>

            <View style={styles.tRowLast}>
              <Text style={styles.tLabel}>Perm. Address</Text>
              <Text style={styles.tValueFull}>{student.address || 'N/A'}</Text>
            </View>
          </View>

          {/* SINGLE PAGE MODE: Render ID Cards inside Page 1 */}
          {mode === 'single' && (
            <View style={styles.idSectionWrapper}>
              <View style={styles.idCardBox}>
                <Text style={styles.idCardLabel}>ID Document (Front)</Text>
                {student.aadhaarFrontUrl ? (
                  <Image src={student.aadhaarFrontUrl} style={styles.idImage} />
                ) : (
                  <Text style={styles.noPhotoText}>No Image Provided</Text>
                )}
              </View>

              <View style={styles.idCardBox}>
                <Text style={styles.idCardLabel}>ID Document (Back)</Text>
                {student.aadhaarBackUrl ? (
                  <Image src={student.aadhaarBackUrl} style={styles.idImage} />
                ) : (
                  <Text style={styles.noPhotoText}>No Image Provided</Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Footer Signatures (Locked to bottom) */}
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

      {/* MULTI PAGE MODE: Render ID Cards on separate pages */}
      {mode === 'multiple' && student.aadhaarFrontUrl && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.annexureTitle}>Annexure: Identity Document (Front)</Text>
          <View style={styles.imagePageWrapper}>
            <Image src={student.aadhaarFrontUrl} style={styles.documentImageLarge} />
          </View>
        </Page>
      )}

      {mode === 'multiple' && student.aadhaarBackUrl && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.annexureTitle}>Annexure: Identity Document (Back)</Text>
          <View style={styles.imagePageWrapper}>
            <Image src={student.aadhaarBackUrl} style={styles.documentImageLarge} />
          </View>
        </Page>
      )}
    </Document>
  );
};